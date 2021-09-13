import {
  initContract,
  addCandidate,
  getKycStatus,
  updateCandidateStatus,
  addOperator,
  listOperator,
  removeOperator,
} from "..";
import { storage, Context, VMContext, logging } from "near-sdk-as";
import { EStatus, KYCContract } from "../model";

beforeEach(() => {
  initContract("test", "bp_clientid_test");
});

describe("basic", () => {
  it("should be initialized", () => {
    expect(storage.getSome<bool>("init")).toBe(true);
  });

  it("add candidate", () => {
    VMContext.setSigner_account_id("acc_1");
    let res = addCandidate();
    expect(res).toBe("F8xtgukED8YwSqjwU23awWgDnVuWX42frvpaDkitkdx4");
  });

  throws(
    "add candidate multiple time should error",
    () => {
      VMContext.setSigner_account_id("acc_1");
      let res = addCandidate();
      expect(res).toBe("F8xtgukED8YwSqjwU23awWgDnVuWX42frvpaDkitkdx4");
      addCandidate();
    },
    "Candidate Id already exists"
  );

  it("get candidate status", () => {
    VMContext.setSigner_account_id("acc_1");
    let res = addCandidate();
    let ins = getKycStatus();
    expect(ins.nearAddress == "acc_1");
  });

  throws(
    "get candidate status not found",
    () => {
      VMContext.setSigner_account_id("acc_1");
      let res = addCandidate();

      VMContext.setSigner_account_id("acc_2");
      let ins = getKycStatus();
    },
    "Candidate Id not exists"
  );

  it("update candidate status", () => {
    VMContext.setSigner_account_id("acc_1");
    let res = addCandidate();
    let ins = getKycStatus();
    expect(ins.status == EStatus.waiting);
    updateCandidateStatus(ins.refId, "1");

    ins = getKycStatus();
    expect(ins.status == EStatus.approve);
  });

  throws(
    "update candidate status invalid transition 1",
    () => {
      VMContext.setSigner_account_id("acc_1");
      let res = addCandidate();
      let ins = getKycStatus();
      expect(ins.status == EStatus.waiting);
      updateCandidateStatus(ins.refId, "0");
    },
    "invalid transition"
  );

  it("update candidate status approve -> waiting", () => {
    VMContext.setSigner_account_id("acc_1");
    let res = addCandidate();
    let ins = getKycStatus();
    expect(ins.status == EStatus.waiting);
    updateCandidateStatus(ins.refId, "1");
    updateCandidateStatus(ins.refId, "0");
    ins = getKycStatus();
    expect(ins.status == EStatus.waiting);
  });
});

describe("acl", () => {
  it("add operator key", () => {
    addOperator("p1");
    let res = listOperator();
    expect(res.length).toBe(2);
  });

  throws(
    "add operator key require owner",
    () => {
      VMContext.setSigner_account_id("acc_1");
      addOperator("p1");
    },
    "require owner"
  );

  throws(
    "add operator key exists",
    () => {
      addOperator("p1");
      addOperator("p1");
    },
    "Pub key is exists"
  );

  it("delete operator key", () => {
    addOperator("p1");
    let res = listOperator();
    // log(res);
    expect(res.length).toBe(2);
    removeOperator("p1");
    res = listOperator();
    expect(res.length).toBe(1);
  });

  throws(
    "delete operator key not exist",
    () => {
      removeOperator("p2");
    },
    "Pub key is not exists"
  );

  it("delete operator key", () => {
    addOperator("p1");
    let res = listOperator();
    // log(res);
    expect(res.length).toBe(2);
    removeOperator("p1");
    res = listOperator();
    expect(res.length).toBe(1);
  });

  it("update candidate status require operator", () => {
    addOperator("p1");
    VMContext.setSigner_account_id("acc_1");
    let res = addCandidate();
    let ins = getKycStatus();
    expect(ins.status == EStatus.waiting);

    // operator side
    VMContext.setSigner_account_pk("p1");
    updateCandidateStatus(ins.refId, "1");
    ins = getKycStatus();
    expect(ins.status == EStatus.approve);
  });

  throws(
    "update candidate status require operator",
    () => {
      VMContext.setSigner_account_id("acc_1");
      let res = addCandidate();
      let ins = getKycStatus();
      expect(ins.status == EStatus.waiting);

      // operator side
      VMContext.setSigner_account_pk("p1");
      updateCandidateStatus(ins.refId, "1");
      ins = getKycStatus();
      expect(ins.status == EStatus.approve);
    },
    "Pub key is not exists"
  );
});
