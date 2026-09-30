import * as React from 'react'

import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import ButtonGroup from '@mui/material/ButtonGroup'
import Container from '@mui/material/Container'
import FormLabel from '@mui/material/FormLabel'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'

import { default as QRCode, type QRCodeProps } from 'react-qr-code'

import { toDataURL } from 'qrcode'
import type { QRCodeRenderersOptions } from 'qrcode'
import { FormControlLabel, FormGroup } from '@mui/material'
import styles from './index.module.css'

type QRCodeLevel = QRCodeProps['level']

interface State extends Pick<QRProps, 'text' | 'level' | 'fgColor' | 'bgColor'> {
  autoSize: number
  useManualSize: boolean
  manualSize: number
}

const levels = ['L', 'M', 'Q', 'H'] as const satisfies readonly QRCodeLevel[]

const DEFAULT_FG_COLOR = '#000000'
const DEFAULT_BG_COLOR = '#ffffff'

export default class Home extends React.Component<object, State> {
  static QR_MIN_HEIGHT = 128

  static QR_MARGIN_HOR = 20

  static QR_MARGIN_VER = 5

  override state: State = {
    text: '',
    level: levels[0],
    fgColor: DEFAULT_FG_COLOR,
    bgColor: DEFAULT_BG_COLOR,

    autoSize: 128,
    useManualSize: false,
    manualSize: 1000,
  }

  storeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value
    this.setState({ text })
  }

  storeLevel = (level: QRCodeLevel, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    this.setState({ level })
  }

  storeFgColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ fgColor: event.target.value })
  }

  storeBgColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ bgColor: event.target.value })
  }

  toggleManual = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ useManualSize: event.target.checked })
  }

  storeManualSize = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ manualSize: parseInt(event.target.value, 10) })
  }

  preventDefault = (event: React.FormEvent) => {
    event.preventDefault()
  }

  override componentDidMount = () => {
    this.updateSize()
    window.addEventListener('resize', this.updateSize)
  }

  override componentWillUnmount = () => {
    window.removeEventListener('resize', this.updateSize)
  }

  updateSize = () => {
    // get the width of the 'form' element.
    // this is the actual width the QR code *should* be.
    const formElement = this.formRef.current
    if (formElement === null) return
    const width = Math.max(
      Home.QR_MIN_HEIGHT,
      formElement.getBoundingClientRect().width - Home.QR_MARGIN_HOR,
    )

    // get the position where the QR code would begin
    const qrElement = this.codeRef.current
    if (qrElement === null) return
    const begin = qrElement.getBoundingClientRect().top

    // compute the maximum height of the window
    const maxHeight = document.documentElement.clientHeight
    const height = maxHeight - begin - Home.QR_MARGIN_VER

    // the size
    const size = Math.min(width, Math.max(height, Home.QR_MIN_HEIGHT))
    this.setState({ autoSize: size })
  }

  private formRef = React.createRef<HTMLFormElement>()

  private codeRef = React.createRef<HTMLDivElement>()

  override render() {
    const {
      text, level, autoSize, manualSize, useManualSize, fgColor, bgColor,
    } = this.state
    const displaySize = useManualSize ? manualSize : autoSize
    return (
      <Container maxWidth="md">
        <form noValidate onSubmit={this.preventDefault} autoComplete="off" ref={this.formRef}>
          <Card>
            <CardHeader title="QR Code Generator" subheader={<>
              Generate and display a QR Code. All data is generated locally and never leaves your device. <br />
              Click on the generated image to open it in a new window.
            </>} />
            <CardContent>

            <Grid container direction="row" spacing={1}>
              <Grid item xs={12}>
                <TextField fullWidth type="text" value={text} onChange={this.storeText} />
              </Grid>
              <Grid container spacing={1} className={styles.controls}>
                <Grid item sm={6} className={styles.control}>
                  <FormLabel component="legend">QR Code Level</FormLabel>
                  <ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">
                    {levels.map((l) => <Button onClick={this.storeLevel.bind(this, l)} key={`variant-${l}`} color={l === level ? 'secondary' : 'primary'}>{l}</Button>)}
                  </ButtonGroup>
                </Grid>
                <Grid item sm={6} className={styles.control}>
                  <FormLabel component="legend">Image Size</FormLabel>
                  <FormGroup row={true}>
                    <FormControlLabel
                      control={<Switch checked={useManualSize} onChange={this.toggleManual} />}
                      label={'Manual'}
                    />
                    <TextField type="number" value={Math.round(displaySize)} onChange={this.storeManualSize} disabled={!useManualSize} />
                  </FormGroup>
                </Grid>
                <Grid item sm={6} className={styles.control}>
                  <FormLabel component="legend" htmlFor="fg-color">Foreground Color</FormLabel>
                  <input id="fg-color" className={styles.colorInput} type="color" value={fgColor} onChange={this.storeFgColor} />
                </Grid>
                <Grid item sm={6} className={styles.control}>
                  <FormLabel component="legend" htmlFor="bg-color">Background Color</FormLabel>
                  <input id="bg-color" className={styles.colorInput} type="color" value={bgColor} onChange={this.storeBgColor} />
                </Grid>
              </Grid>
            </Grid>

            </CardContent>
          </Card>
        </form>

        <br />
        <div className={styles.qr} ref={this.codeRef}>
          {text !== '' && <QRRender text={text} level={level} size={displaySize} fgColor={fgColor} bgColor={bgColor} />}
        </div>
        <br />
      </Container>
    )
  }
}

interface QRProps {
  text: string
  level: QRCodeLevel
  size: number
  fgColor: string
  bgColor: string
}

class QRRender extends React.Component<QRProps, { key: string; data?: string }> {
  override state: { key: string; data?: string } = { key: '' }

  private mounted = true

  override componentWillUnmount() {
    this.mounted = false
  }

  static getKey({ level, text, size, fgColor, bgColor }: QRProps): string {
    return `${level};${size.toString()};${fgColor};${bgColor};${text}`
  }

  static getDerivedStateFromProps(props: QRProps) {
    return { key: QRRender.getKey(props) }
  }

  private async updateCodeState() {
    const { text, level, size, fgColor, bgColor } = this.props

    const data = await toDataURL(text, {
      errorCorrectionLevel: level,
      type: 'image/png',
      width: size,
      color: { dark: fgColor, light: bgColor },
    } as QRCodeRenderersOptions)

    if (!this.mounted) return
    this.setState({ data })
  }

  override componentDidMount() {
    void this.updateCodeState()
  }

  override componentDidUpdate(prevProps: QRProps) {
    const key = QRRender.getKey(this.props)
    const prevKey = QRRender.getKey(prevProps)

    if (key === prevKey) return
    void this.updateCodeState()
  }

  override render() {
    const { text, level, size, fgColor, bgColor } = this.props
    const { key } = this.state
    let { data } = this.state
    if (QRRender.getKey(this.props) !== key) {
      data = undefined
    }

    const code = <QRCode value={text} level={level} size={size} fgColor={fgColor} bgColor={bgColor} />
    if (data !== undefined) {
      return <a href={data} target="_blank" rel="noreferrer">{code}</a>
    }
    return code
  }
}
// spellchecker:words qrcode
