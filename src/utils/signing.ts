import { fromBase64 } from '@cosmjs/encoding';
import { verifyADR36Amino } from '@sei-js/core/dist/lib/utils/signing';

export const verifySignature = async (
	signerAddress: string,
	message: string,
	signatureInput: { pub_key: { type: string; value: string }; signature: string }
): Promise<boolean> => {
	try {
		const { pub_key, signature } = signatureInput;
		return verifyADR36Amino('sei', signerAddress, message, fromBase64(pub_key.value), fromBase64(signature));
	} catch (e: any) {
		console.info('error verifying cosmos signature', e.message);
		return false;
	}
};
