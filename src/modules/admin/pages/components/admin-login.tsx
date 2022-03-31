import React from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { ethers } from 'ethers';

const GlobalStyle = createGlobalStyle`
  html, body, #app {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
  }

  *, button {
    font-family: 'Roboto', sans-serif;
    outline: none;
    box-sizing: border-box;
  }
`;

const Wrapper = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;s
  flex-direction: column;
  height: 100%;
  background: white;

  
  &:before, &:after {
    content: '';
    margin:auto;
    top:0;
    bottom:0;
    display: block;
    background-repeat: no-repeat;
    position: absolute;
    width: 100%;
    background-size: auto 100%;
    background-color: transparent;
  }
  
  &:before {
    left:0;
    background-image: url('/images/login-background-left.png');
    background-position: left;
  }
   &:after {
    right:0;
    background-image: url('/images/login-background-right.png');
    background-position: right;
  }
`;

const Content = styled.section`
  background: #fff;
  height: 440px;
  max-width: 860px;
  display: flex;
  margin: 0 auto;
  box-shadow: 0px 2px 3px 3px rgb(137 138 154 );
  z-index: 10;
  border-radius:8px;

  @media (max-width: 400px) {
    width: 100%;
    height 100%;
  }
`;

const LogoBox = styled.section`
  color: #fff;
  padding: 48px;
  width: 380px;
  flex-grow: 0;
  display: block;
  position: relative;
  background-image: url('/images/jump-login.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;

  @media (max-width: 900px) {
    display: none;
  }
`;

const LoginBox = styled.section`
  padding: 48px;
  width: 420px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  justify-content: center;

  @media (max-width: 400px) {
    width: 100%;
    height 100%;
  }
`;

const Form = styled.form`
  width: 100%;
  margin-bottom: 0;
`;

const ErrorBox = styled.div`
  font-family: Roboto, sans-serif;
  font-size: 12px;
  line-height: 24px;
  font-weight: 400;
  background: rgba(242, 74, 51, 0.35);
  border: 1px solid #f24a33;
  padding: 8px;
  margin: 0px 0 16px 0;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const ButtonWrapper = styled.div`
  text-align: center;
  margin-top: 12px;
  gap: 8px;
  max-width: fit-content;
  display: flex;
  justify-content: center;
  margin: auto;
  flex-direction: column;
`;

const SubmitButton = styled.button`
  font-size: 14px;
  background-color: white;
  -webkit-appearance: none;
  -moz-appearance: none;
  outline: 0;
  display: inline-block;

  line-height: 24px;
  vertical-align: middle;
  border: 2px solid black;
  border-radius: 4px;
  font-weight: bold;
  color: black;
  -webkit-text-decoration: none;
  text-decoration: none;
  padding: 4px 32px;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
  justify-content: start;
  padding: 8px 16px;
  width: 100%;

  span {
    font-family: 'League Gothic';
    font-size: 24px;
    text-transform: uppercase;
    font-weight: 400;
    font-style: normal;
  }

  img {
    margin-right: 12px;
    height: 26px;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  &:focus {
    background: rgba(0, 0, 0, 0.1);
    box-shadow: 0px 2px 2px 0px rgb(137 138 154);
  }
`;

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
  margin-top: 50px;
  animation: ${rotate360} 1s linear infinite;
  transform: translateZ(0);
  border-top: 3px solid rgba(66, 104, 246, 0.8);
  border-right: 3px solid rgba(66, 104, 246, 0.8);
  border-bottom: 3px solid rgba(66, 104, 246, 0.8);
  border-left: 6px solid #4268f6;
  background: transparent;
  width: 80px;
  height: 80px;
  border-radius: 50%;
`;

const H1 = styled.h1`
  font-family: 'League Gothic';
  font-size: 34px;
  letter-spacing: 0.25px;
  margin-bottom: 24px;
  color: rgba(0, 0, 0, 0.87);
  margin-top: 0;
  line-height: 123.5%;
  font-weight: 400;
  font-style: normal;
`;

const Description = styled.div`
  font-family: 'Rubik', sans-serif;
  letter-spacing: 0.15px;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  text-align: center;
  max-width: 280px;
  margin-bottom: 24px;
  font-style: normal;
`;

const AllRightsReserved = styled.div`
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  margin: auto;
  width: fit-content;
  font-size: 14px;
  color: #cfcfcf;
  z-index: 10;
`;

export const AdminLogin = () => {
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onLogin = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const message = 'Sign here to login to Jump!\nLogin nonce: ' + window.nonce;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.on('network', (newNetwork, oldNetwork) => {
        if (oldNetwork) {
          window.location.reload();
        }
      });
      const addresses = await provider.send('eth_requestAccounts', []);
      const signed = await provider.getSigner().signMessage(message);
      await axios.post('/admin/login', {
        address: addresses[0],
        message,
        signed,
      });
      window.location.reload();
    } catch (error) {
      if (error.response.data?.message) {
        setError(error.response.data.message);
      }
      setLoading(false);
    }
  }, []);

  return (
    <>
      <GlobalStyle />
      <Wrapper>
        <AllRightsReserved>&copy; Third Venture, Inc. - All rights reserved.</AllRightsReserved>
        <Content>
          <LogoBox />
          <LoginBox>
            <H1>Login to your account</H1>
            <Description>You can connect with one of those three providers</Description>
            {error && <ErrorBox>{error}</ErrorBox>}
            {loading ? (
              <Spinner />
            ) : (
              <>
                <Form>
                  <ButtonWrapper>
                    <SubmitButton type="button" onClick={onLogin}>
                      <img src="/images/metamask.png" alt="Login with metamask" />
                      <span>METAMASK</span>
                    </SubmitButton>
                    <SubmitButton type="button" onClick={onLogin}>
                      <img src="/images/coinbase.png" alt="Login with coinbase wallet" />
                      <span>COINBASE WALLET</span>
                    </SubmitButton>
                    <SubmitButton type="button" onClick={onLogin}>
                      <img src="/images/brave.png" alt="Login with brave" />
                      <span>BRAVE</span>
                    </SubmitButton>
                  </ButtonWrapper>
                </Form>
              </>
            )}
          </LoginBox>
        </Content>
      </Wrapper>
    </>
  );
};

declare global {
  interface Window {
    web3: any;
    ethereum: any;
    nonce: string;
  }
}

const mountNode = window.document.getElementById('app');
ReactDOM.render(<AdminLogin />, mountNode);
