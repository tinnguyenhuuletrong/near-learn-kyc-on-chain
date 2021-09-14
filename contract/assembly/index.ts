import { context, Context, logging, storage } from "near-sdk-as";
import { KYCCandidate, KYCContract } from "./model";

let contract: KYCContract;

/*********/
/* Main  */
/*********/

export function initContract(
  bizName: string,
  bizBlockpassClientId: string
): KYCContract {
  /// Initializes the contract with the given NEAR foundation account ID.
  assert(!storage.hasKey("init"), "Already initialized");

  contract = new KYCContract(bizName, bizBlockpassClientId);
  storage.set("init", true);
  contract.addOperatorPubKey(context.senderPublicKey);
  storage.set("_ins", contract);
  return contract;
}

/***********/
/* Read */
/***********/

export function getKycStatus(accId: string = context.sender): KYCCandidate {
  _isInit();
  const ins = contract.getCandidateByAccId(accId) as KYCCandidate;
  return ins;
}

export function hasCandidate(accId: string): boolean {
  _isInit();
  return contract.hasCandidate(accId);
}

@nearBindgen
export class InfoReturnObj {
  owner: string;
  bizName: string;
  bizBlockpassClientId: string;
}
export function info(): InfoReturnObj {
  _isInit();
  const owner = contract.owner;
  const bizName = contract.bizName;
  const bizBlockpassClientId = contract.bizBlockpassClientId;
  const res = new InfoReturnObj();
  res.owner = owner;
  res.bizName = bizName;
  res.bizBlockpassClientId = bizBlockpassClientId;
  return res;
}

/***********/
/* Write */
/***********/

export function addCandidate(): string {
  _isInit();
  const candidate = contract.addCandidate();
  return candidate.refId;
}

export function updateCandidateStatus(refId: string, status: string): boolean {
  _isInit();
  contract.updateCandidateStatus(refId, status);
  return true;
}

export function addOperator(pubKey: string): void {
  _isInit();
  contract.addOperatorPubKey(pubKey);
}

export function removeOperator(pubKey: string): void {
  _isInit();
  contract.removeOperatorPubKey(pubKey);
}

export function listOperator(): string[] {
  _isInit();
  return contract.listOperatorPubKey();
}

/************/
/* Internal */
/************/

function _isInit(): void {
  assert(
    storage.hasKey("init") && storage.getSome<bool>("init") == true,
    "The contract should be initialized before usage."
  );
  contract = storage.getSome<KYCContract>("_ins");
}
