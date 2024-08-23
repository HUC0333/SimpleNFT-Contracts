import { toNano } from '@ton/core';
import { JadeTokenContract } from '../wrappers/JadeTokenContract';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const jadeTokenContract = provider.open(await JadeTokenContract.fromInit());

    await jadeTokenContract.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(jadeTokenContract.address);

    // run methods on `jadeTokenContract`
}
