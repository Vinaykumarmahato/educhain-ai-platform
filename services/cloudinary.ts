
const sha1 = async (str: string) => {
    const enc = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-1', enc.encode(str));
    return Array.from(new Uint8Array(hash))
        .map(v => v.toString(16).padStart(2, '0'))
        .join('');
};

export const uploadToCloudinary = async (file: File) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
    const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

    if (!cloudName || cloudName.includes('PLACEHOLDER')) {
        // Fallback Mock for Demo if keys are missing
        console.warn('Cloudinary keys missing. Simulating upload.');
        return new Promise<string>((resolve) => {
            setTimeout(() => {
                resolve(URL.createObjectURL(file));
            }, 1000);
        });
    }

    const timestamp = Math.round((new Date()).getTime() / 1000);

    // Cloudinary requires parameters to be sorted alphabetically for signature
    // We only use 'timestamp' here, so it's trivial.
    const signatureString = `timestamp=${timestamp}${apiSecret}`;
    const signature = await sha1(signatureString);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
};
