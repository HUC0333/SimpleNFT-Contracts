import { toNano } from '@ton/core';
import { JadeWallet } from '../wrappers/JadeWallet';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const jadeWallet = provider.open(await JadeWallet.fromInit());

    await jadeWallet.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(jadeWallet.address);

    // run methods on `jadeWallet`
}
