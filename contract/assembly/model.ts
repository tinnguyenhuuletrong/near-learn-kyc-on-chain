import {
  base58,
  context,
  logging,
  math,
  PersistentMap,
  PersistentSet,
  PersistentUnorderedMap,
  util,
} from "near-sdk-core";

export enum EStatus {
  waiting,
  approve,
}
const ALL_STATUS = [EStatus.waiting.toString(), EStatus.approve.toString()];

@nearBindgen
export class KYCCandidate {
  nearAddress: string;
  refId: string;
  status: EStatus;
  createdAt: u64;
  approvedAt: u64;
}

@nearBindgen
export class KYCContract {
  bizName: string;
  bizBlockpassClientId: string;
  owner: string;
  operatorPubKeys: PersistentSet<string>;
  candidateMap: PersistentUnorderedMap<string, KYCCandidate>;
  refIdMap: PersistentMap<string, string>;

  constructor(bizName: string, bizBlockpassClientId: string) {
    this.owner = context.sender;
    this.bizName = bizName;
    this.bizBlockpassClientId = bizBlockpassClientId;
    this.candidateMap = new PersistentUnorderedMap<string, KYCCandidate>("c");
    this.refIdMap = new PersistentMap<string, string>("r");
    this.operatorPubKeys = new PersistentSet<string>("o");
  }

  // ------------------- //
  // Candidate
  // ------------------- //

  getCandidateByAccId(accId: string): KYCCandidate {
    this._ensureHasAcc(accId);
    return this.candidateMap.get(accId) as KYCCandidate;
  }

  getCandidateByRefId(refId: string): KYCCandidate {
    const accId = this.refIdMap.get(refId);
    assert(!!accId, "Ref Id not exists");
    return this.candidateMap.get(accId as string) as KYCCandidate;
  }

  addCandidate(): KYCCandidate {
    const accId = context.sender;
    this._ensureNotHasAcc(accId);

    let newCandidate = new KYCCandidate();
    newCandidate.createdAt = context.blockTimestamp;
    newCandidate.approvedAt = 0;
    newCandidate.status = EStatus.waiting;
    newCandidate.nearAddress = accId;
    newCandidate.refId = base58.encode(math.sha256(util.stringToBytes(accId)));

    this.candidateMap.set(accId, newCandidate);
    this.refIdMap.set(newCandidate.refId, accId);
    return newCandidate;
  }

  updateCandidateStatus(refId: string, status: string): KYCCandidate {
    this._ensureHasRefId(refId);
    this._ensureStatusValid(status);
    this._ensureOperatorPubKey(context.senderPublicKey);

    const estatus: EStatus = parseInt(status) as EStatus;
    const ins = this.getCandidateByRefId(refId);
    switch (ins.status) {
      case EStatus.waiting:
        assert(estatus === EStatus.approve, "invalid transition");
        ins.status = EStatus.approve;
        ins.approvedAt = context.blockTimestamp;
        break;

      case EStatus.approve:
        assert(estatus === EStatus.waiting, "invalid transition");
        ins.status = EStatus.waiting;
        ins.approvedAt = 0;
        break;
    }

    this.candidateMap.set(ins.nearAddress, ins);
    return ins;
  }

  // ------------------- //
  // Operator
  // ------------------- //

  addOperatorPubKey(pubKey: string): void {
    this._isOwner();
    this._ensureOperatorNotExist(pubKey);
    this.operatorPubKeys.add(pubKey);
  }

  removeOperatorPubKey(pubKey: string): void {
    this._isOwner();
    this._ensureOperatorPubKey(pubKey);
    this.operatorPubKeys.delete(pubKey);
  }

  listOperatorPubKey(): string[] {
    this._isOwner();
    return this.operatorPubKeys.values();
  }

  // ------------------- //
  // Checker
  // ------------------- //

  private _ensureStatusValid(status: string): void {
    assert(ALL_STATUS.includes(status), "Unknown status");
  }

  private _ensureHasAcc(accId: string): void {
    assert(this.candidateMap.contains(accId), "Candidate Id not exists");
  }
  private _ensureHasRefId(refId: string): void {
    assert(this.refIdMap.contains(refId), "Ref Id not exists");
  }
  private _ensureNotHasAcc(accId: string): void {
    assert(!this.candidateMap.contains(accId), "Candidate Id already exists");
  }
  private _ensureOperatorNotExist(pubKey: string): void {
    assert(!this.operatorPubKeys.has(pubKey), "Pub key is exists");
  }
  private _ensureOperatorPubKey(pubKey: string): void {
    assert(this.operatorPubKeys.has(pubKey), "Pub key is not exists");
  }
  private _isOwner(): void {
    // === will failed ?
    // https://github.com/AssemblyScript/assemblyscript/issues/621
    assert(this.owner == context.sender, "require owner");
  }
}
