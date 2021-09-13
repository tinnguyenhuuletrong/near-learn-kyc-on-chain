## init contract

```sh
near call dev-1631519031086-9364402 initContract '{"bizName": "test", "bizBlockpassClientId": "ttin_test_e6e05"}' --accountId dev-1631519031086-9364402

near call dev-1631519031086-9364402 addCandidate --accountId dev-1631519031086-9364402

near call dev-1631519031086-9364402 updateCandidateStatus '{"refId": "ECz4McR81TkgxhqssRhqM88ahAGJHR8GMaTdJxqgKXT1", "status": "1"}' --accountId dev-1631519031086-9364402

# pub key ed25519:9TkDHnVhQ9DjbXRJ8VdVMM9Qso7R44QziJdiN8pJtLdc => 1xxxxx (replace 'ed25519:' => 1)
near call dev-1631519031086-9364402 addOperator '{"pubKey": "19TkDHnVhQ9DjbXRJ8VdVMM9Qso7R44QziJdiN8pJtLdc"}' --accountId dev-1631519031086-9364402
```

## call view status

```sh
near view dev-1631519031086-9364402 hasCandidate '{"accId": "dev-1631519031086-9364402"}'
near view dev-1631519031086-9364402 info
near view dev-1631519031086-9364402 getKycStatus '{"accId": "dev-1631519031086-9364402"}'
```

## view storage

```sh
near view-state dev-1631519031086-9364402 --finality final
```
