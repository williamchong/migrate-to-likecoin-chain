<template>
  <div v-if="type==='metamask'">
    <metamask-dialog
      @cancel="onCancel"
    >
      {{ metamaskMessage }}
    </metamask-dialog>
  </div>
  <div v-else-if="type==='ledger'">
    <ledger-dialog
      @confirm="createWeb3Ledger"
      @cancel="onCancel"
    >
      {{ ledgerMessage }}
    </ledger-dialog>
  </div>
  <div v-else>
    <button
      @click="createWeb3"
    >
      {{ $t('General.button.connectMetaMask' ) }}
    </button>
    <button
      @click="onClickUseLedger"
    >
      {{ $t('General.button.connectLedger' ) }}
    </button>
  </div>
</template>
<script>
import * as eth from '../util/eth';
import {
  getLedgerWeb3Engine,
} from '../util/ledger';
import LedgerDialog from './LedgerDialog.vue';
import MetamaskDialog from './MetamaskDialog.vue';

export default {
  components: {
    LedgerDialog,
    MetamaskDialog,
  },
  data() {
    return {
      error: '',
      type: '',
      ledgerMessage: '',
      metamaskMessage: '',
    };
  },
  methods: {
    async createWeb3() {
      try {
        this.type = 'metamask';
        this.metamaskMessage = this.$t('StepEthereum.message.waitingForMetamask');
        let web3;
        if (window.ethereum) {
          await window.ethereum.enable();
          web3 = eth.initWindowWeb3(window.ethereum);
        } if (window.web3) {
          web3 = eth.initWindowWeb3(window.web3.currentProvider);
        }
        if (!web3) throw new Error(this.$t('StepEthereum.message.noWeb3'));
        await eth.checkNetwork();
        const ethAddress = await eth.getFromAddr();
        const ethBalance = await eth.getLikeCoinBalance(ethAddress);
        const isLedger = false;
        this.metamaskMessage = '';
        this.$emit('confirm', {
          ethAddress,
          ethBalance,
          web3,
          isLedger,
        });
      } catch (err) {
        console.error(err);
        this.metamaskMessage = err;
      }
    },
    async createWeb3Ledger() {
      try {
        this.ledgerMessage = this.$t('StepEthereum.message.waitingForEthApp');
        const web3 = eth.initWindowWeb3(await getLedgerWeb3Engine());
        const ethAddress = await eth.getFromAddr();
        const ethBalance = await eth.getLikeCoinBalance(ethAddress);
        const isLedger = true;
        this.ledgerMessage = '';
        this.$emit('confirm', {
          ethAddress,
          ethBalance,
          web3,
          isLedger,
        });
      } catch (err) {
        console.error(err);
        this.ledgerMessage = err;
      }
    },
    onClickUseLedger() {
      this.type = 'ledger';
    },
    onCancel() {
      this.type = '';
    },
  },
};
</script>