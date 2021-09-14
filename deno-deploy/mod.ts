import * as nearAPI from "https://dev.jspm.io/near-api-js";

const nearApi = nearAPI.default as any;
const { connect, keyStores } = nearApi;
const config = {
  networkId: "testnet",
  keyStore: new keyStores.InMemoryKeyStore(),
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
};
const ACC_ID = "blockpass-kyc-onchain-alpha.ttintest.testnet";
const PRIVATE_KEY =
  "2go3cuvBJp3DQ4Rxwmt1SZN6Y2VcJVDkFjgfbPKP2nDJ8eLUygg6gk9oDvEkFtyqzVaKmDALENKrUdBoRwodDSC9";
const CONTRACT_ID = "dev-1631519031086-9364402";

async function handleRequest(request: Request) {
  // connect to NEAR
  const near = await connect(config);

  // load keys
  const keyPair = new nearApi.utils.key_pair.KeyPairEd25519(PRIVATE_KEY);
  await config.keyStore.setKey(config.networkId, ACC_ID, keyPair);

  // create sc
  const account = await near.account(ACC_ID);
  const contract = new nearApi.Contract(
    account, // the account object that is connecting
    CONTRACT_ID,
    {
      // name of contract you're connecting to
      changeMethods: ["updateCandidateStatus"], // change methods modify state
      sender: account, // account object to initialize and sign transactions.
    }
  );

  // console.log(
  //   await contract.updateCandidateStatus({
  //     refId: "ECz4McR81TkgxhqssRhqM88ahAGJHR8GMaTdJxqgKXT1",
  //     status: "1",
  //   })
  // );

  // create wallet connection
  // const wallet = new WalletConnection(near);
  const balance = await account.getAccountBalance();
  const body = await request.json();

  const json = JSON.stringify({
    accName: ACC_ID,
    balance,
    body,
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

addEventListener("fetch", (event: any) => {
  event.respondWith(handleRequest(event.request));
});
