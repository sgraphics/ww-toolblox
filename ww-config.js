export default {
    inherit: 'ww-text',
    options: {
        autoByContent: true,
    },
    editor: {
        label: {
            en: 'Toolblox',
        },
        icon: 'cursor-click',
    },
    states: ['focus', 'disabled'],
    actions: [{ label: 'Start X.com login', action: 'xLogin' }],
    triggerEvents: [
        { name: 'focus', label: { en: 'On focus' }, event: null },
        { name: 'authenticated', label: { en: 'On authenticated' }, event: { value: '' } },
        { name: 'blur', label: { en: 'On blur' }, event: null },
    ],
    properties: {
        xanoApi:
        {
            label: { en: 'XANO API URL', fr: 'XANO API URL' },
            type: 'Text',
            section: 'settings',
            defaultValue: false,
            bindable: false,
            options: {
                placeholder: 'Base url for XANO APIs. E.g. "https://xsrr-l2ye-dpbj.f2.xano.io/api:NUVFj-l-:Web3Auth"',
            },
            defaultValue: '',
            /* wwEditor:start */
            // bindingValidation: {
            //     type: 'string',
            //     tooltip: 'Base url for XANO APIs. E.g. "https://xsrr-l2ye-dpbj.f2.xano.io/api:NUVFj-l-:Web3Auth"',
            // },
            /* wwEditor:end */
        },
    },
};
