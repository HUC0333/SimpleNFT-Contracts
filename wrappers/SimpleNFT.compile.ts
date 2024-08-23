import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/simple_n_f_t.tact',
    options: {
        debug: true,
    },
};
