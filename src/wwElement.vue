<template>
    <span style="width:200px;height:300px">&nbsp;&nbsp;</span>
</template>

<script>
let web3authGlobal = {};
let authTokenGlobal = "";
let web3InitializedGlobal = false;
/* wwEditor:start */

    import { Web3AuthNoModal } from '@web3auth/no-modal';
    import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
    import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, WALLET_ADAPTERS } from "@web3auth/base";
    import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
    import { ethers } from "ethers";
    import { MetamaskAdapter } from "@web3auth/metamask-adapter";
    import { base, WalletClientSigner } from "@alchemy/aa-core";
    import { createLightAccountClient } from "@alchemy/aa-accounts";
    import { http, encodeFunctionData, createWalletClient, custom } from "viem";

    window.Web3AuthNoModal = Web3AuthNoModal;
    window.EthereumPrivateKeyProvider = EthereumPrivateKeyProvider;
    window.CHAIN_NAMESPACES = CHAIN_NAMESPACES;
    window.WEB3AUTH_NETWORK = WEB3AUTH_NETWORK;
    window.WALLET_ADAPTERS = WALLET_ADAPTERS;
    window.OpenloginAdapter = OpenloginAdapter;
    window.ethers = ethers;
    window.MetamaskAdapter = MetamaskAdapter;
    window.WalletClientSigner = WalletClientSigner;



    window.initComplete = Promise.resolve();
/* wwEditor:end */

export default {
    props: {
        content: { type: Object, required: true },
        wwFrontState: { type: Object, required: true },
        wwElementState: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },
    emits: [
        'add-state',
        'remove-state',
        'trigger-event'
    ],
    beforeMount() {
        function getQueryParams(url) {
            let params = {};
            let parser = document.createElement('a');
            parser.href = url;
            let query = parser.search.substring(1);
            let vars = query.split('&');
            for (let i = 0; i < vars.length; i++) {
                let pair = vars[i].split('=');
                params[pair[0]] = decodeURIComponent(pair[1]);
            }
            return params;
        }
        const fetchXJwtFromXano = async (oauthToken, oauthVerifier) => {
            if (web3authGlobal?.connected == true)
            {
                //connect X to login
                await fetch(this.content.xanoXEndpoint + '/oauth/twitter/connect', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authTokenGlobal}`,
                    },
                    body: JSON.stringify({
                        oauth_token: oauthToken,
                        oauth_verifier: oauthVerifier
                    })
                });
                return "";
            }else{      
                //login with X          
                const response = await fetch(this.content.xanoXEndpoint + '/oauth/twitter/access_token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        oauth_token: oauthToken,
                        oauth_verifier: oauthVerifier
                    })
                });
                const data = await response.json();
                return data.authToken; // Assuming the JWT is in the `token` field
            }
        };
        const fetchGoogleJwtFromXano = async (googleCode) => {
            const response = await fetch(this.content.googleEndpoint + '/oauth/google/continue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: googleCode,
                    redirect_uri: window.location.href
                })
            });
            const data = await response.json();
            //alert(JSON.stringify(data));
            return data.authToken; // Assuming the JWT is in the `token` field
        };

        // Define the function to authenticate with Web3Auth
        const authenticateWithWeb3Auth = async (web3auth, jwt) => {
            if (!web3auth.connected)
            {
                await web3auth.connectTo("openlogin", {
                    loginProvider: "jwt",
                    extraLoginOptions: {
                        id_token: jwt,
                        verifierIdField: "sub",
                        domain: window.location.href,
                    },
                });
            }
            return web3auth;
        };
        
        // Define the function to authenticate with Web3Auth
        const initWeb3Auth = async () => {
            const chainConfig = {
                chainNamespace: window.CHAIN_NAMESPACES.EIP155,
                chainId: "0x2105",
                displayName: "Base Mainnet",
                rpcTarget: "https://mainnet.base.org",
                blockExplorerUrl: "https://base.blockscout.com",
                ticker: "ETH",
                tickerName: "Ethereum",
                logo: "https://github.com/base-org/brand-kit/raw/main/logo/in-product/Base_Network_Logo.svg",
            };

            const privateKeyProvider = new window.EthereumPrivateKeyProvider({
                config: { chainConfig },
            });
            
            var clientId = this.content.clientId;
/* wwEditor:start */
            //RDDTORTEST environment
            clientId = "BCD3bVaYA3ZHu3F0bEs6eEyk3OzC1zZvTwkFkFQsiicid-7H4bxyQgBlC9IxCipUYlEbQ1P6ZqBzuDBAMx7svIA";
/* wwEditor:end */
            const web3AuthOptions = {
                clientId,
                web3AuthNetwork: window.WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
                privateKeyProvider,
            };

            const web3auth = new window.Web3AuthNoModal(web3AuthOptions);
            web3authGlobal = web3auth;

            //OpenLogin
            const openloginAdapter = new window.OpenloginAdapter({
                adapterSettings: {
                    clientId: clientId,
                    network: window.WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
                    uxMode: "redirect",
                    redirectUrl: window.location.href,
                    loginConfig: {
                        jwt: {
                            name: "X Login",
                            verifier: "rddtor-verifier",
                            verifierSubIdentifier: "xano-twitter-rddtor-verifier",
                            typeOfLogin: "jwt",
                            clientId: clientId,
                        },
                        google: {
                            name: "Google Login",
                            verifier: "rddtor-verifier",
                            verifierSubIdentifier: "google-rddtor-verifier",
                            typeOfLogin: "google",
                            clientId: this.content.googleClientId,
                        },
                    },
                },
            });

            web3auth.configureAdapter(openloginAdapter);
        
            /* wwFront:start */
            //Wallet Connect
            /*
            const defaultWcSettings = await getWalletConnectV2Settings(
                "eip155",
                ["8453"],
                this.content.walletConnectProjectId,
            );
            const walletConnectModal = new WalletConnectModal({
                projectId: this.content.walletConnectProjectId,
            });
            const walletConnectV2Adapter = new WalletConnectV2Adapter({
                adapterSettings: { qrcodeModal: walletConnectModal, ...defaultWcSettings.adapterSettings },
                loginSettings: { ...defaultWcSettings.loginSettings },
            });
            
            web3auth.configureAdapter(walletConnectV2Adapter);

            const coinbaseAdapter = new CoinbaseAdapter({
                clientId: this.content.coinbaseProjectId,
                sessionTime: 86400,
                web3AuthNetwork: window.WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
            });
            web3auth.configureAdapter(coinbaseAdapter);
*/
            /* wwFront:end */

            //Metamask
            const metamaskAdapter = new MetamaskAdapter({
                clientId,
                sessionTime: 86400,
                web3AuthNetwork: window.WEB3AUTH_NETWORK.SAPPHIRE_DEVNET
                });
            web3auth.configureAdapter(metamaskAdapter);
        
            await web3auth.init();

            return web3auth;
        };

        // Main async function to handle the login process
        const handleLogin = async (oauthToken, oauthVerifier, googleCode) => {
            await window.initComplete;
            const web3auth = await initWeb3Auth();
            
/* wwEditor:start */
            await this.trySign(web3auth);
/* wwEditor:end */

            if (web3auth.connected)
            {
                try {
                    const result = await this.sendWeb3AuthTokenToXano(web3auth);
                    console.log("Login successful:", result);
                } catch (error) {
                    console.error("Login failed:", error);
                }
            }
            //Do NOT use "else if" here. Need to authenticate to be able to add login to existing user.
            if (oauthToken && oauthVerifier){                
                try {
                    const jwt = await fetchXJwtFromXano(oauthToken, oauthVerifier);
                    await authenticateWithWeb3Auth(web3auth, jwt);
                } catch (error) {
                    console.error("Starting login failed:", error);
                }
            }
            else if (googleCode){                
                try {
                    const jwt = await fetchGoogleJwtFromXano(googleCode);
                    await authenticateWithWeb3Auth(web3auth, jwt);
                } catch (error) {
                    console.error("Starting login failed:", error);
                }
            }
        };

        // Get query parameters
        let queryParams = getQueryParams(window.location.href);
        let oauthToken = queryParams['oauth_token'];
        let oauthVerifier = queryParams['oauth_verifier'];
        let code = queryParams['code'];

        // Perform actions if both oauth_token and oauth_verifier are set
        if (oauthToken || oauthVerifier || code) {
            function removeUrlParameters(url, parameters) {
                let urlObj = new URL(url);
                parameters.forEach(param => urlObj.searchParams.delete(param));
                return urlObj.toString();
            }
            // Get the current URL
            const currentUrl = window.location.href;
            // Parameters to remove
            const paramsToRemove = ['oauth_token', 'oauth_verifier', 'code', 'scope', 'authuser', 'prompt', 'hd'];
            // Get the new URL without the specified parameters
            const newUrl = removeUrlParameters(currentUrl, paramsToRemove);
            // Replace the current history state with the new URL
            window.history.replaceState({}, document.title, newUrl);
        }
        if (web3InitializedGlobal == false)
        {
            web3InitializedGlobal = true;
            handleLogin(oauthToken, oauthVerifier, code);
        }

        // /* wwEditor:start */
        // const { createElement } = wwLib.useCreateElement();
        // /* wwEditor:end */

        // return {
        //     /* wwEditor:start */
        //     createElement,
        //     /* wwEditor:end */
        // };
    },
    data() {
        return {
            isReallyFocused: false,
        };
    },
    computed: {
        isEditing() {
            /* wwEditor:start */
            return this.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        tag() {
            return 'div';
        },
        isAuthenticated()
        {
            return web3authGlobal?.connected == true;
        },
        isFocused() {
            /* wwEditor:start */
            if (this.wwEditorState.isSelected) {
                return this.wwElementState.states.includes('focus');
            }
            /* wwEditor:end */
            return this.isReallyFocused;
        },
    },
    watch: {
        isReallyFocused(isFocused, wasFocused) {
            if (isFocused && !wasFocused) {
                this.$emit('trigger-event', { name: 'focus' });
            } else if (!isFocused && wasFocused) {
                this.$emit('trigger-event', { name: 'blur' });
            }
        },
        isFocused: {
            immediate: true,
            handler(value) {
                if (value) {
                    this.$emit('add-state', 'focus');
                } else {
                    this.$emit('remove-state', 'focus');
                }
            },
        },
    },
    methods: {
        logout() {
            (async function() {
                try {
                    await web3authGlobal.logout();
                    console.log('Successfully logged out');
                } catch (error) {
                    console.error('Logout failed:', error);
                }
            })();
        },
        googleLogin()
        {
            if (web3authGlobal.connected)
            {
                return;
            }
            const fetchRequestUrlFromXano = async () => {
                const response = await fetch(this.content.googleEndpoint + '/oauth/google/init?redirect_uri=' + window.location.href, {
                    method: 'GET'
                });
                const data = await response.json();                
                return data.authUrl;
            };
            const startGoogleLogin = async () => {
                try {
                    
                    const authUrl = await fetchRequestUrlFromXano();
                    
                    window.location.href = authUrl;
                } catch (error) {
                    console.error("Login failed:", error);
                }
            };
            startGoogleLogin();
        },
        xLogin() {
            //Do not check if connected because we want to start the login process to connect to X to fetch X username
            const fetchRequestUrlFromXano = async () => {
                const response = await fetch(this.content.xanoXEndpoint + '/oauth/twitter/request_token?redirect_uri=' + window.location.href, {
                    method: 'GET'
                });
                const data = await response.json();                
                return data.authUrl;
            };
            const startXLogin = async () => {
                try {
                    const authUrl = await fetchRequestUrlFromXano();                    
                    window.location.href = authUrl;
                } catch (error) {
                    console.error("Login failed:", error);
                }
            };
            startXLogin();
        },
        walletLogin() {
            const startWalletLogin = async () => {
                if (!web3authGlobal.connected)
                {
                    await web3authGlobal.connectTo(window.WALLET_ADAPTERS.WALLET_CONNECT_V2);
                    if (web3authGlobal.connected)
                    {
                        await this.sendWeb3AuthTokenToXano(web3authGlobal);
                    }
                }
            };
            startWalletLogin();
        },
        metamaskLogin() {
            const startMetamaskLogin = async () => {
                if (!web3authGlobal.connected)
                {
                    await web3authGlobal.connectTo(window.WALLET_ADAPTERS.METAMASK);
                    if (web3authGlobal.connected)
                    {
                        await this.sendWeb3AuthTokenToXano(web3authGlobal);
                    }
                }
            };
            startMetamaskLogin();
        },
        coinbaseLogin() {
            const startCoinbaseLogin = async () => {
                if (!web3authGlobal.connected)
                {
                    await web3authGlobal.connectTo(window.WALLET_ADAPTERS.COINBASE);
                    if (web3authGlobal.connected)
                    {
                        await this.sendWeb3AuthTokenToXano(web3authGlobal);
                    }
                }
            };
            startCoinbaseLogin();
        },
        onBlur() {
            this.isReallyFocused = false;
        },
        async trySign(web3auth)
        {
            if (web3auth.connected){
                await web3authGlobal.logout();
            }
            await web3authGlobal.connectTo(window.WALLET_ADAPTERS.METAMASK);

            const connectedAdapter = web3authGlobal.walletAdapters[web3authGlobal.connectedAdapterName];
            const walletClient = createWalletClient({
                transport: custom(connectedAdapter.provider),
            });
            const web3AuthSigner = new WalletClientSigner(walletClient, "web3auth");

            const smartAccountClient = await createLightAccountClient({
                transport: http("https://mainnet.base.org"),
                chain: base,
                account: 
                {
                    signer: web3AuthSigner,
                },
            });
            
            var account = smartAccountClient.account;

            //Build user operation locally
            const uoStruct = {
                sender: account.address,
                nonce: await account.getNonce(),
                initCode: account.getInitCode(),
                callData: encodeFunctionData({
                    abi: [
                        {
                            "inputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "fire",
                                    "type": "uint256"
                                }
                            ],
                            "name": "getCount",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "name": "increment",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        }
                    ],
                    functionName: "getCount",
                    args: [1],
                }),
                callGasLimit: "0x1",
                verificationGasLimit: "0x1",
                preVerificationGas: "0x1",
                maxFeePerGas: "0x1",
                maxPriorityFeePerGas: "0x1",
                paymasterAndData: "0x1",
                signature: account.getDummySignature(),
            };

            const request = await smartAccountClient.signUserOperation({ uoStruct });
            
            alert(JSON.stringify(request));
            const entryPointAddress = account.getEntryPoint().address;
            const uoHash = await smartAccountClient.sendRawUserOperation({ request, entryPoint: entryPointAddress });

            alert(JSON.stringify(signedUserOperation));
        },
        async sendWeb3AuthTokenToXano(web3auth)
        {
            const authenticationResult = await web3auth.authenticateUser();
            
            const web3authToken = authenticationResult.idToken;
            var xanoUrl = this.content.xanoWeb3AuthEndpoint;
            /* wwEditor:start */
            xanoUrl = "https://xsrr-l2ye-dpbj.f2.xano.io/api:-jxPeK3Y";
            /* wwEditor:end */
            const response = await fetch(xanoUrl + '/oauth/web3auth/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: web3authToken
                })
            });
            const data = await response.json();
            var authToken = data.authToken;
            authTokenGlobal = authToken;
            this.$emit('trigger-event', { name: 'authenticated', event: { value: authToken } });
            /*
            //another way to get the wallet:
            var userId = data.user_id;
            var wallet = data.wallet;
            var signer = await (new window.ethers.BrowserProvider(web3auth.walletAdapters.openlogin.privateKeyProvider)).getSigner();
            wallet = await signer.getAddress();
            */
            return data;
        }
    },
};
</script>

<style scoped>
.ww-typeform-embed.ww-editing {
    pointer-events: none;
}
</style>
