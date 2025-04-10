import { AppProps } from "next/app";
import Script from "next/script";

export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
        <Script
            src="https://cdn.tiny.cloud/1/1ltwngmor0as1pm1fyqud4iuiz9xu5p3es2xwfwtg7rh12zk/tinymce/7/tinymce.min.js"
            strategy="afterInteractive"
        />
        <Component {...pageProps} />
        </>
    );
}