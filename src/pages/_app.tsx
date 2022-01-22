import '@fontsource/roboto';

import App from "next/app";

import { ThemeProvider, createTheme, makeStyles } from '@material-ui/core/styles';

const defaultTheme = createTheme({});
export default class extends App {
    render() {
        const { Component, pageProps } = this.props;
        return <ThemeProvider theme={defaultTheme}><Component {...pageProps} /></ThemeProvider>;
    }
}