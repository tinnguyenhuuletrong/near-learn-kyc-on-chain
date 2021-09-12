import * as NEARAPI from "./lib/near-api-js.min.js";
async function main() {
  const m = await import("./lib/near-api-js.min.js");
  const nearAPI = (window as any).nearApi;

  const { connect, keyStores, WalletConnection } = nearAPI;

  const config = {
    networkId: "testnet",
    keyStore: new keyStores.InMemoryKeyStore(),
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
  };

  // connect to NEAR
  const near = await connect(config);
  const account: NEARAPI.Account = await near.account(
    "example-account.testnet"
  );
  console.log(await account.getAccountBalance());
  console.log(await account.getAccessKeys());

  // create wallet connection
  // const wallet = new WalletConnection(near);
}
main();
