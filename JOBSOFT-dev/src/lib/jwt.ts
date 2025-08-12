import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import fetch from 'node-fetch';

let pems: { [key: string]: string } = {};

const COGNITO_USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const COGNITO_REGION = process.env.NEXT_PUBLIC_COGNITO_REGION;

if (!COGNITO_USER_POOL_ID || !COGNITO_REGION) {
  throw new Error("Cognito User Pool ID and Region must be configured in environment variables.");
}

const jwksUrl = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/jwks.json`;

interface Jwks {
  keys: {
    alg: string;
    e: string;
    kid: string;
    kty: string;
    n: string;
    use: string;
  }[];
}

const getPems = async () => {
  if (Object.keys(pems).length > 0) {
    return pems;
  }

  try {
    const response = await fetch(jwksUrl);
    const jwks = (await response.json()) as Jwks;
    pems = jwks.keys.reduce((acc: any, key: any) => {
      acc[key.kid] = jwkToPem({ kty: key.kty, n: key.n, e: key.e });
      return acc;
    }, {});
    return pems;
  } catch (error) {
    console.error("Error fetching JWKS:", error);
    pems = {};
    return pems;
  }
};

export const validateToken = async (token: string) => {
  try {
    const pems = await getPems();
    if (Object.keys(pems).length === 0) {
      throw new Error("Could not fetch JWKS. Cannot validate token.");
    }

    const decodedJwt = jwt.decode(token, { complete: true });
    if (!decodedJwt) {
      throw new Error("Invalid token.");
    }

    const kid = decodedJwt.header.kid;
    if (!kid) {
      throw new Error("Token does not have a kid.");
    }

    const pem = pems[kid];
    if (!pem) {
      throw new Error("Invalid kid.");
    }

    return jwt.verify(token, pem, {
      issuer: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`,
      algorithms: ['RS256'],
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return null;
  }
}; 