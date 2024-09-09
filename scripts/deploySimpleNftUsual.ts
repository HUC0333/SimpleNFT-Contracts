import { toNano } from '@ton/core';
import { SimpleNftUsual } from '../wrappers/SimpleNftUsual';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const simpleNftUsual = provider.open(await SimpleNftUsual.fromInit(BigInt(Math.floor(Math.random() * 10000))));

    await simpleNftUsual.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(simpleNftUsual.address);

    console.log('ID', await simpleNftUsual.getId());
}
