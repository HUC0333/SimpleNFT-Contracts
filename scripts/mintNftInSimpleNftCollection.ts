import { Address, toNano } from '@ton/core';
import { SimpleNftCollection } from '../wrappers/SimpleNftCollection';
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('SimpleNftUsual address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const simpleNftCollection = provider.open(SimpleNftCollection.fromAddress(address));

    const dataInfo = await simpleNftCollection.getGetCollectionData();

    await simpleNftCollection.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        "Mint"
    );

    ui.write('Waiting for counter to increase...');

    let dataInfoAfter = await simpleNftCollection.getGetCollectionData();
    let attempt = 1;
    console.log("Changes: ", dataInfo, dataInfoAfter)

    ui.clearActionPrompt();
    ui.write('Counter increased successfully!');
}
