import * as React from "react"
import Page from "../components/page";

import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Container from "@material-ui/core/Container";
import FormLabel from "@material-ui/core/FormLabel";
import Grid from "@material-ui/core/Grid";
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import TextField from "@material-ui/core/TextField";

import {default as QRCode, QRCodeProps} from "react-qr-code";

import {QRCodeErrorCorrectionLevel, toDataURL} from "qrcode";

type QRCodeLevel = QRCodeProps["level"];

interface State {
  text: string;
  level: QRCodeLevel;
  size: number;
}

const levels = ['L', 'M', 'Q', 'H'] as QRCodeLevel[];

export default class Home extends React.Component<{}, State> {
  static QR_MIN_HEIGHT = 128;
  static QR_MARGIN_HOR = 20;
  static QR_MARGIN_VER = 60;

  state: State = {
    text: "",
    level: levels[0],
    size: 128,
  }

  storeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    this.setState({ text });
  }

  storeLevel = (level: QRCodeLevel, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    this.setState({ level });
  }

  preventDefault = (event: React.FormEvent) => {
    event.preventDefault();
  }

  componentDidMount = () => {
    this.updateSize();
    window.addEventListener('resize', this.updateSize);
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.updateSize);
  }

  updateSize = () => {
    // get the width of the 'form' element.
    // this is the actual width the QR code *should* be.
    const formElement = this.formRef.current;
    if (formElement === null) return;
    const width = Math.max(
      Home.QR_MIN_HEIGHT,
      formElement.getBoundingClientRect().width - Home.QR_MARGIN_HOR,
    );
    
    // get the positon where the QR code would begin
    const qrElement = this.codeRef.current;
    if (qrElement === null) return;
    const begin = qrElement.getBoundingClientRect().top;

    // compute the maximum height of the window
    const maxHeight = document.documentElement.clientHeight;
    const height = maxHeight - begin - Home.QR_MARGIN_VER;
    
    // the size 
    const size = Math.min(width, Math.max(height, Home.QR_MIN_HEIGHT));
    this.setState({ size });
  }

  private formRef = React.createRef<HTMLFormElement>();
  private codeRef = React.createRef<HTMLDivElement>();

  render() {
    const { text, level, size } = this.state;
    return (
      <Container maxWidth="md">
        <form noValidate onSubmit={this.preventDefault} autoComplete="off" ref={this.formRef}>
          <Page title="QR Code Generator" url="https://qr.everyone.wtf/" description="Generate QR Codes for Everyone" />

          <Card>
            <CardHeader title="QR Code Generator" subheader="Generate and display a QR Code. All data is generated locally and never leaves your device. " />
            <CardContent>

            <Grid container direction="row" spacing={1}>
              <Grid container spacing={1}>
                <Grid item sm={12}>
                  <TextField fullWidth type="text" value={text || ""} onChange={this.storeText} />
                </Grid>
              </Grid>
              <Grid container spacing={1}>
                <Grid item sm={6}>
                  <br />
                  <FormLabel component="legend">Level</FormLabel>
                  <ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">
                    {levels.map(l =>
                      <Button onClick={this.storeLevel.bind(this, l)} key={`variant-${l}`} color={l === level ? "secondary" : "primary"}>{l}</Button>)}
                  </ButtonGroup>
                </Grid>
              </Grid>
            </Grid>

            </CardContent>
          </Card>
        </form>

        <br />
        <div style={{width: '100%', textAlign: 'center'}} ref={this.codeRef}>
          {text != "" && <QRRender text={text} level={level} size={size} />}
        </div>
        <br />
      </Container>
    );
  }
}

class QRRender extends React.Component<State, { key: string; data?: string }> {
  state: { key: string; data?: string } = { key: "" };

  private mounted = true;
  componentWillUnmount() {
    this.mounted = false;
  }

  static getKey({level, text, size}: State): string {
    return level + ";" + size.toString() + ";" + text;
  }

  static getDerivedStateFromProps(props: State) {
    return { key: QRRender.getKey(props) };
  }

  private async updateCodeState() {
    const { text, level, size } = this.props;
  
    const data = await toDataURL(text, {errorCorrectionLevel: level, type: 'image/png', width: size });

    if (!this.mounted) return;
    this.setState({ data });
  }

  componentDidMount() {
    this.updateCodeState();
  }

  componentDidUpdate(prevProps: State) {
    const key = QRRender.getKey(this.props);
    const prevKey = QRRender.getKey(prevProps);
    
    if (key === prevKey) return;
    this.updateCodeState();
  }

  render() {
    const { text, level, size } = this.props;
    let { key, data } = this.state;
    if (QRRender.getKey(this.props) != key) {
      data = undefined;
    }

    const code = <QRCode value={text} level={level} size={size} />;
    if (data !== undefined) {
      return <a href={data} target="_blank">{code}</a>;
    } else {
      return code;
    }
  }
}