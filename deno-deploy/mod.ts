import * as NEARAPI from "./lib/near-api-js.min.js";
async function handleRequest(request: Request) {
  let dummy = NEARAPI;

  const nearAPI = (window as any).nearApi;
  const accName = "example-account.testnet";

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
  const account: NEARAPI.Account = await near.account(accName);
  const balance = await account.getAccountBalance();
  const keys = await account.getAccessKeys();

  // create wallet connection
  // const wallet = new WalletConnection(near);

  const json = JSON.stringify({
    accName,
    balance,
    keys,
  });

  return new Response(json, {
    headers: {
      // The "text/html" part implies to the client that the content is HTML
      // and the "charset=UTF-8" part implies to the client that the content
      // is encoded using UTF-8.
      "content-type": "application/json; charset=UTF-8",
    },
  });
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});
