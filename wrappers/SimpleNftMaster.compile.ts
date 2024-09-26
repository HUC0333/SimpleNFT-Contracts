import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/simple_nft_master.tact',
    options: {
        debug: true,
    },
};
