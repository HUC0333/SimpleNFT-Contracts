import { Address, toNano } from '@ton/core';
import { SimpleNFT } from '../wrappers/SimpleNFT';
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('SimpleNFT address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const simpleNFT = provider.open(SimpleNFT.fromAddress(address));

    const counterBefore = await simpleNFT.getCounter();


    ui.write('Waiting for counter to increase...');

    let counterAfter = await simpleNFT.getCounter();
    let attempt = 1;
    while (counterAfter === counterBefore) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        counterAfter = await simpleNFT.getCounter();
        attempt++;
    }

    ui.clearActionPrompt();
    ui.write('Counter increased successfully!');
}
