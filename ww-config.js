const INFO = {
    submit: 'sub',
    reset: 'rst',
    button: 'btn',
};

export default {
    inherit: 'ww-text',
    options: {
        autoByContent: true,
        disableLink: content => content.disabled,
    },
    editor: {
        label: {
            en: 'Toolblox',
        },
        icon: 'cursor-click',
        infoTags: content => {
            if (content.buttonType && INFO[content.buttonType]) {
                return {
                    color: 'var(--ww-color-blue-500)',
                    backgroundColor: 'var(--ww-color-blue-100)',
                    text: INFO[content.buttonType].toUpperCase(),
                    action: () => {
                        wwLib.wwSearchBar.executeAction({
                            actions: wwLib.wwSearchBar.getEditSidebarActions('settings', 'custom-0'),
                        });
                    },
                };
            } else {
                return [];
            }
        },
        workflowHint: content => {
            if (content.buttonType !== 'submit') {
                return false;
            }

            return {
                type: 'warning',
                header: {
                    en: 'You probably shouldn’t trigger workflows on submit buttons.',
                    fr: 'Vous ne devriez pas déclencher un workflow depuis un bouton submit',
                },
                text: {
                    en: 'For your users to benefit from automatic form field validation, you should trigger submit workflows on the form container. Unless you are 100% sure of what you’re doing and want to bypass this behavior.',
                    fr: 'Pour que vos utilisateurs bénéficient de la validation automatique des champs de formulaire, vous devez déclencher des workflows de soumission sur le conteneur de formulaire. À moins que vous ne soyez sûr à 100 % de ce que vous faites et que vous souhaitiez contourner ce comportement.',
                },
                button: {
                    text: { en: 'Select form container', fr: 'Selectionnez le form container' },
                    action: 'selectParentFormContainer',
                },
            };
        },
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
                placeholder: 'xano-api',
            },
            defaultValue: '',
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Base url for XANO APIs. E.g. "https://xsrr-l2ye-dpbj.f2.xano.io/api:NUVFj-l-:Web3Auth"',
            },
            /* wwEditor:end */
        },
        backgroundColor: {
            label: {
                en: 'Text Background',
                fr: 'Background du Texte',
            },
            type: 'Color',
            options: {
                nullable: true,
            },
            bindable: true,
            responsive: true,
            states: true,
            classes: true,
            /* wwEditor:start */
            bindingValidation: {
                cssSupports: 'color',
                type: 'string',
                tooltip: 'A string that represents a color code: `"rebeccapurple" | "#00ff00" | "rgb(214, 122, 127)"`',
            },
            /* wwEditor:end */
        },
        buttonType: {
            label: {
                en: 'Type',
                fr: 'Type',
            },
            type: 'TextSelect',
            section: 'settings',
            options: {
                options: [
                    { value: null, label: 'none' },
                    { value: 'button', label: 'Button' },
                    { value: 'submit', label: 'Submit Button' },
                ],
            },
            defaultValue: 'button',
            bindable: true,
            bindingValidation: {
                type: 'string',
                tooltip: 'A string that defines the button type: `"button" | "submit"`',
            },
        },
        disabled: {
            label: { en: 'Disabled' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'A boolean that defines if the button is disabled: `true | false`',
            },
            /* wwEditor:end */
        },
        hasLeftIcon: {
            label: { en: 'Left icon', fr: 'Icône gauche' },
            section: 'settings',
            type: 'OnOff',
        },
        leftIcon: {
            hidden: true,
        },
        hasRightIcon: {
            label: { en: 'Right icon', fr: 'Icône droite' },
            type: 'OnOff',
            section: 'settings',
        },
        rightIcon: {
            hidden: true,
        },
    },
};
