'use babel';

import {compile_aless, compile_sless, creat_less, handle_saved_less_file} from './less-compiler'


export default {
    activate(state) {

        atom.commands.add('atom-workspace', {
            "emp-frontend-devtool:compile_aless":compile_aless,
            "emp-frontend-devtool:compile_sless":compile_sless,
            "emp-frontend-devtool:creat_less":creat_less,
            'core:save':handle_saved_less_file

        })

    },
}
