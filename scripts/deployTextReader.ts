import { toNano } from '@ton/core';
import { TextReader } from '../wrappers/TextReader';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const textReader = provider.open(await TextReader.fromInit(BigInt(Math.floor(Math.random() * 10000))));

    await textReader.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(textReader.address);

    console.log('ID', await textReader.getId());
}
