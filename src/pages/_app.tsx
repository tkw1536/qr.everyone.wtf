import '@fontsource/roboto';

import App from "next/app";

import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({});

export default class extends App {
    render() {
        const { Component, pageProps } = this.props;
        return (
                <ThemeProvider theme={theme}><Component {...pageProps} /></ThemeProvider>
        );
    }
}