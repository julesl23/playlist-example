import { useContext, useState, useEffect } from 'react';

//import { snap } from '../utils';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import { defaultSnapOrigin } from '../config';

import {
  connectSnap,
  getSnap,
  sendHello,
  shouldDisplayReconnectButton,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  Card,
} from '../components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);

  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [removeAddress, setRemoveAddress] = useState('');

  useEffect(() => {
    console.log('Addresses updated:', addresses);
  }, [addresses]);

  // useEffect(() => {
  //   async function loadAddresses() {
  //     try {
  //       //        const loadedAddresses = await snap.get('addresses');
  //       const loadedAddresses = await window.ethereum.request({
  //         method: 'snap_manageState',
  //         params: { operation: 'get' },
  //       });

  //       console.log('loadedAddresses:', loadedAddresses);
  //       setAddresses(loadedAddresses);
  //     } catch (e) {
  //       console.error(e);
  //       dispatch({ type: MetamaskActions.SetError, payload: e });
  //     }
  //   }
  //   loadAddresses();
  // }, []);

  const handleAddAddress = () => {
    console.log('addresses before:', addresses);
    console.log('newAddress:', newAddress);
    setAddresses((prevAddresses) => [...prevAddresses, newAddress]);
    console.log('addresses after:', addresses);
    setNewAddress('');
  };

  const handleRemoveAddress = () => {
    setAddresses((prevAddresses) =>
      prevAddresses.filter((address) => address !== removeAddress),
    );
    setRemoveAddress('');
  };

  const handleSaveAddresses = async () => {
    await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: [
        defaultSnapOrigin,
        {
          method: 'save_addresses',
          params: addresses,
        },
      ],
    });
  };

  const handleLoadAddresses = async () => {
    const theAddresses = (await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: [
        defaultSnapOrigin,
        {
          method: 'load_addresses',
        },
      ],
    })) as string[];
    setAddresses(theAddresses);
  };

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSendHelloClick = async () => {
    try {
      await sendHello();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <Container>
      <Heading>
        Welcome to <Span>template-snap</Span>
      </Heading>
      <Subtitle>
        Get started by editing <code>src/index.ts</code>
      </Subtitle>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}
        <Card
          content={{
            title: 'Send Hello message',
            description:
              'Display a custom message within a confirmation screen in MetaMask.',
            button: (
              <SendHelloButton
                onClick={handleSendHelloClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            state.isFlask &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />

        {/* In the Index component: */}
        <Card
          content={{
            title: 'List of Addresses',
            description: (
              <>
                <p>List of Ethereum addresses:</p>
                <ul>
                  {addresses.map((address) => (
                    <li key={address}>{address}</li>
                  ))}
                </ul>
              </>
            ),
          }}
          fullWidth
        />

        <Card
          content={{
            title: 'Add Address',
            description: (
              <>
                <p>Add a new Ethereum address to the list:</p>
                <div>
                  <input
                    type="text"
                    placeholder="Enter address"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                  />
                  <button onClick={handleAddAddress}>Add</button>
                </div>
              </>
            ),
          }}
        />

        <Card
          content={{
            title: 'Remove Address',
            description: (
              <>
                <p>Remove an Ethereum address from the list:</p>
                <div>
                  <input
                    type="text"
                    placeholder="Enter address"
                    value={removeAddress}
                    onChange={(e) => setRemoveAddress(e.target.value)}
                  />
                  <button onClick={handleRemoveAddress}>Remove</button>
                </div>
              </>
            ),
          }}
        />

        <Card
          content={{
            title: 'Save Addresses',
            description: 'Save the list of Ethereum addresses:',
            button: (
              <button
                onClick={handleSaveAddresses}
                disabled={!state.installedSnap}
              >
                Save
              </button>
            ),
          }}
          disabled={!state.installedSnap}
        />

        <Card
          content={{
            title: 'Load Addresses',
            description: 'Load the list of Ethereum addresses:',
            button: (
              <button
                onClick={handleLoadAddresses}
                disabled={!state.installedSnap}
              >
                Load
              </button>
            ),
          }}
          disabled={!state.installedSnap}
        />

        <Notice>
          <p>
            Please note that the <b>snap.manifest.json</b> and{' '}
            <b>package.json</b> must be located in the server root directory and
            the bundle must be hosted at the location specified by the location
            field.
          </p>
        </Notice>
      </CardContainer>
    </Container>
  );
};

export default Index;