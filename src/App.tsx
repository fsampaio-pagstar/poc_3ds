
import { PrimeReactProvider } from 'primereact/api';
import './App.css';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import axios from 'axios';
import * as DeviceInfo from './device/index';

function App() {

  const [email, setEmail] = useState('fmarques899@gmail.com');
  const [cellPhone, setCellPhone] = useState('61982638893');
  const [birthdate, setBirthdate] = useState('1993-02-27');
  const [ownerDoc, setOwnerDoc] = useState('04718287189');
  const [zipCode, setZipCode] = useState('70673083');
  const [address, setAddress] = useState('CCSW 300B Bloco 4');
  const [number, setNumber] = useState('219');
  const [complement, setComplement] = useState('Edifício Diamond');
  const [neighborhood, setNeighborhood] = useState('Setor Sudoeste');
  const [city, setCity] = useState('Brasília');
  const [uf, setUf] = useState('DF');
  const [country, setCountry] = useState('BR');
  const [cardName, setCardName] = useState<string>('FELIPE S M SOUZA');
  const [cardNumber, setCardNumber] = useState<string>('5162922018891133');
  const [expMonth, setExpMonth] = useState<string>('02');
  const [expYear, setExpYear] = useState<string>('2032');
  const [cvv, setCvv] = useState<string>('036');
  const [accessToken, setAccessToken] = useState<string>();
  const [dataCollectionUrl, setDataCollectionUrl] = useState<string>();
  const [movementId, setMovementId] = useState<string>();
  const [transactionSessionId, setTransactionSessionId] = useState<string>();
  const [challengeInfoWidth, setChallengeInfoWidth] = useState<number>();
  const [challengeInfoHeight, setChallengeInfoHeight] = useState<number>();
  const [challengeStepUpURL, setChallengeStepUpURL] = useState<string>();
  const [challengeAccessToken, setChallengeAccessToken] = useState<string>();
  const [installments, setInstallments] = useState<string>("1");

  const generateRandomIdentifier = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let identifier = '';

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      identifier += characters.charAt(randomIndex);
    }

    return identifier;
  }

  const getRandomFloat = (min: number, max: number) => {
    return Number((Math.random() * (max - min) + min).toFixed(2));
  }

  const pay = async () => {
    const responseSetup = await setup();

  }

  const setup = async () => {
    const result = await axios.post(`${process.env.REACT_APP_API_CREDIT_URL}/v4/3ds/setup`, {
      cardNumber,
      expirationYear: Number(expYear),
      expirationMonth: Number(expMonth),
      movementId,
    });
    setTransactionSessionId(result?.data?.transactionSessionId?.code);
    setAccessToken(result?.data?.consumerAuthenticationInformation?.accessToken);
    setDataCollectionUrl(result?.data?.consumerAuthenticationInformation?.dataCollectionUrl);

    const enrollmentRes = await enrollment(result?.data?.consumerAuthenticationInformation?.accessToken, result?.data?.transactionSessionId?.code);

    // console.log(enrollmentRes.data);
    setChallengeAccessToken(enrollmentRes?.challengeInformation.accessToken);
    setChallengeInfoHeight(enrollmentRes?.challengeInformation.width);
    setChallengeInfoWidth(enrollmentRes?.challengeInformation.height);
    setChallengeStepUpURL(enrollmentRes?.challengeInformation.stepUpUrl);
    setTimeout(() => {
      const form = document.querySelector('#step-up-form') as any;
      if (form) {
        form.submit();
      }
    }, 5000)

    return { accessToken: result?.data?.consumerAuthenticationInformation?.accessToken, dataCollectionUrl: result?.data?.consumerAuthenticationInformation?.dataCollectionUrl }
  }

  const enrollment = async (accessToken: string, transactionSessionId: string) => {
    const deviceInfo = await getDeviceInfo();
    const body = {
      "transactionSessionId": transactionSessionId,
      "setupAccessToken": accessToken,
      "movementId": movementId,
      "paymentInformation": {
        "holderName": cardName,
        "number": cardNumber,
        "expirationMonth": Number(expMonth),
        "expirationYear": Number(expYear),
        "securityCode": cvv,
        "document": ownerDoc
      },
      "billingAddress": {
        "street": address,
        "number": number,
        "complement": complement,
        "postCode": zipCode,
        "district": neighborhood,
        "city": city,
        "state": uf,
        "country": country
      },
      "payer": {
        "name": cardName,
        "document": ownerDoc,
        "birthDate": birthdate,
        "email": email,
        "ddd": cellPhone[0] + cellPhone[1],
        "phone": cellPhone.slice(2)
      },
      "deviceInformation": deviceInfo,
      "installmentsNumber": Number(installments)
    };

    if (deviceInfo) {
      const result = await axios.post(`${process.env.REACT_APP_API_CREDIT_URL}/v4/3ds/enrollment`, body);

      return result.data;
    }

  }


  const createPayment = async () => {
    const paymentRes = await axios.post(`${process.env.REACT_APP_API_CREDIT_URL}/v4/payment`, {
      // value: getRandomFloat(1, 100),
      value: 3,
      maxInstallments: 12,
      description: "RANDOM 3ds TEST",
      transactionId: generateRandomIdentifier(),
      callbackUrl: "https://webhook.site/128968ca-9244-46e4-9fa7-acfa0d9d9bfe",
      redirectUrl: "http://www.pagstar.com",
      fraudPreventProtocol: "3DS"
    }, {
      headers: {
        Authorization: `Bearer 781881|HbMLEZqYkBwARmEbuStYSazjHBhUoXOvKqVycBXw`
      }
    });

    setMovementId(paymentRes.data.movementId);
  }

  const getDeviceInfo = async () => {
    const info = await DeviceInfo.getDeviceInfo()
    console.log(info);
    return info;
  }

  useEffect(() => {
    createPayment();
    getDeviceInfo();
  }, [])

  // useEffect(() => {
  //   if (accessToken) {
  //     const form = document.querySelector('#step-up-form') as any;
  //     if (form) {
  //       form.submit();
  //     }
  //   }
  // }, [accessToken]);

  useEffect(() => {
    if (challengeAccessToken && challengeInfoHeight && challengeInfoWidth) {
      const stepUpForm = document.querySelector('#ddc-form') as any;
    }
  }, [challengeAccessToken])
  return (
    <PrimeReactProvider>
      <b>{movementId}</b>
      <h1>{
        // eslint-disable-next-line no-restricted-globals
        // screen.width

      }</h1>
      <div>Informações Pessoais</div>

      <InputText placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
      <InputText placeholder="Celular" value={cellPhone} onChange={(e) => setCellPhone(e.target.value)} />
      <InputText placeholder="Data Nascimento" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
      <InputText placeholder="Documento" value={ownerDoc} onChange={(e) => setOwnerDoc(e.target.value)} /><br></br>
      <br></br>
      <div>Endereço</div>
      <InputText placeholder="CEP" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
      <InputText placeholder="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} />
      <InputText placeholder="Número" value={number} onChange={(e) => setNumber(e.target.value)} />
      <InputText value={complement} placeholder="Complemento" onChange={(e) => setComplement(e.target.value)} />
      <InputText value={neighborhood} placeholder="Bairro" onChange={(e) => setNeighborhood(e.target.value)} />
      <InputText value={city} placeholder="Cidade" onChange={(e) => setCity(e.target.value)} />
      <InputText value={uf} placeholder="Estado" onChange={(e) => setUf(e.target.value)} />
      <InputText value={country} placeholder="País" onChange={(e) => setCountry(e.target.value)} /> <br></br>
      <br></br>
      <div>Cartão de Crédito</div>
      <InputText placeholder="Nome impresso no cartão" value={cardName} onChange={(e) => setCardName(e.target.value)} />
      <InputText placeholder="Número do cartão" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
      <InputText placeholder="Mês validade" value={expMonth} onChange={(e) => setExpMonth(e.target.value)} />
      <InputText placeholder="Ano validade" value={expYear} onChange={(e) => setExpYear(e.target.value)} />
      <InputText placeholder="CVV" value={cvv} onChange={(e) => setCvv(e.target.value)} /><br></br>
      <InputText placeholder="Parcelas" value={installments} onChange={(e) => setInstallments(e.target.value)} /><br />
      <iframe name="ddc-iframe" height="1" width="1" style={{ display: 'none' }}></iframe>
      <form id="ddc-form" target="ddc-iframe" method="POST" action={dataCollectionUrl}>
        <input type="hidden" name="JWT" value={accessToken} />
      </form>
      <br />

      Height: {challengeInfoHeight}<br />
      Width: {challengeInfoWidth}<br />
      AccessToken: {challengeAccessToken}<br />
      URL: {challengeStepUpURL}<br />

      <iframe name="step-up-iframe" height={challengeInfoHeight} width={challengeInfoWidth}></iframe><form id="step-up-form" target="step-up-iframe" method="POST" action={challengeStepUpURL}>
        <input type="hidden" name="JWT" value={challengeAccessToken}></input>
      </form>
      <Button onClick={() => { pay() }}>PAY</Button>
    </PrimeReactProvider >)
}

export default App;
