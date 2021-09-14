<template>
  <div>
    <button class="link" style="float: right" v-on:click="logout">
      Sign out
    </button>
    <main>
      <h1 v-if="bizName">
        BizName:
        <label
          for="greeting"
          style="color: var(--secondary);border-bottom: 2px solid var(--secondary);"
        >{{ bizName }}</label
        >
      </h1>
      <h5>
        Near Acc: <label>{{ accountId }}</label>
      </h5>
      <div v-if="shouldShowKycButton" class="register-container">
        <button v-on:click="startKyc">Start KYC</button>
        <div id="blockpass-kyc-connect" />
      </div>
      <div v-if="isApproved">
        <h2> Congratulation your KYC check completed </h2>
        <h6>  * unlock some action </h6>
      </div>
      <!-- <form v-on:submit.prevent="saveGreeting">
        <fieldset ref="fieldset">
          <label
            for="greeting"
            style="display:block; color:var(--gray);margin-bottom:0.5em;"
          >Change greeting</label>
          <div style="display:flex">
            <input v-model="newGreeting" autocomplete="off" id="greeting" style="flex:1" />
            <button id="save" style="border-radius:0 5px 5px 0">Save</button>
          </div>
        </fieldset>
      </form> -->
    </main>

    <Notification
      v-show="notificationVisible"
      ref="notification"
      :networkId="networkId"
      :msg="'called method: setGreeting'"
      :contractId="contractId"
      :visible="false"
    />
  </div>
</template>

<style>
.register-container {
  display: flex;
  align-items: center;
  flex-direction: column;
}
</style>

<script>
import { logout } from "../utils";

import Notification from "./Notification.vue";

export default {
  name: "SignedIn",

  beforeMount() {
    if (this.isSignedIn) {
      this.retrieveInfo();
    }
  },

  components: {
    Notification,
  },

  data: function() {
    return {
      kycStatus: "",
      savedGreeting: "",
      newGreeting: "",
      notificationVisible: false,
      bizName: "",
      clientId: "",
      scHasCandidate: false,
      scRefId: ""
    };
  },

  computed: {
    isSignedIn() {
      return window.walletConnection
        ? window.walletConnection.isSignedIn()
        : false;
    },
    accountId() {
      return window.accountId;
    },
    contractId() {
      return window.contract ? window.contract.contractId : null;
    },
    networkId() {
      return window.networkId;
    },
    shouldShowKycButton() {
      return ["not_found", "waiting"].includes(this.kycStatus);
    },
    isApproved() {
      return ["approved"].includes(this.kycStatus);
    }
  },

  methods: {
    async retrieveInfo() {
      const scInfo = await window.contract.info();
      console.log(scInfo);
      this.bizName = scInfo.bizName;
      this.clientId = scInfo.bizBlockpassClientId;

      const hasCandidate = await window.contract.hasCandidate({
        accId: this.accountId,
      });
      this.scHasCandidate = hasCandidate;
      if (!hasCandidate) this.kycStatus = "not_found";
      else {
        const kycStatusInfo = await window.contract.getKycStatus({
          accId: this.accountId,
        });
        console.log(kycStatusInfo);
        switch (kycStatusInfo.status) {
        case 0:
          this.kycStatus = "waiting";
          break;
        case 1:
          this.kycStatus = "approved";
          break;
        }
        this.scRefId = kycStatusInfo.refId
      }
    },

    // saveGreeting: async function () {
    //   // fired on form submit button used to update the greeting

    //   // disable the form while the value gets updated on-chain
    //   this.$refs.fieldset.disabled = true

    //   try {

    //     // make an update call to the smart contract
    //     await window.contract.setGreeting({
    //       // pass the new greeting
    //       message: this.newGreeting,
    //     })
    //   } catch (e) {
    //     alert(
    //       "Something went wrong! " +
    //         "Maybe you need to sign out and back in? " +
    //         "Check your browser console for more info."
    //     )
    //     throw e //re-throw
    //   } finally {
    //     // re-enable the form, whether the call succeeded or failed
    //     this.$refs.fieldset.disabled = false
    //   }

    //   // update savedGreeting with persisted value
    //   this.savedGreeting = this.newGreeting

    //   this.notificationVisible = true //show new notification

    //   // remove Notification again after css animation completes
    //   // this allows it to be shown again next time the form is submitted
    //   setTimeout(() => {
    //     this.notificationVisible = false
    //   }, 11000)

    // },

    async startKyc() {
      try {
        if(!this.scHasCandidate) {
          const res = await window.contract.addCandidate({
            accountId: this.accountId,
          });
          console.log(res);
          this.scRefId = res
        }
      } catch (error) {
        alert(error.message);
      }


      // start KYC widget
      this._startWidget(this.scRefId)
    },

    _startWidget(refId) {
      console.log(refId)
      // cleanup
      const oldNode = document.getElementById("blockpass-kyc-connect");
      const newNode = oldNode.cloneNode(true);
      oldNode.parentNode.replaceChild(newNode, oldNode);

      // eslint-disable-next-line no-undef
      const sdk = new BlockpassKYCConnect(this.clientId, {
        local_user_id: refId,
      });
      sdk.startKYCConnect();
      const btn = document.getElementById("blockpass-kyc-connect");
      btn && btn.click && btn.click();
    },

    logout: logout,
  },
};
</script>
