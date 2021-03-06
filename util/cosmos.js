import axios from 'axios';
import { timeout } from '../common/util/misc';

const api = axios.create({
  baseURL: '/api/proxy/cosmos/txs',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function waitForTxToBeMined(txHash) {
  let tx;
  let notFoundOnce = false;
  while (!tx) {
    /* eslint-disable no-await-in-loop */
    await timeout(1000);
    try {
      const { data } = await api.get(`/${txHash}`);
      if (data && data.height) {
        ({ tx } = data);
        const {
          code,
          logs: [{ success = false } = {}] = [],
        } = data;
        const isFailed = (code && code !== '0') || !success;
        if (isFailed) throw new Error(code);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      if (err.response && err.response.status === 404) {
        if (notFoundOnce) throw err;
        notFoundOnce = true;
        await timeout(12000); // wait for 2 block + 2s
      } else {
        throw err;
      }
    }
  }
  return tx;
}

export default waitForTxToBeMined;
