import * as React from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import Collapse from '@mui/material/Collapse'
import Container from '@mui/material/Container'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

import { default as QRCode, type QRCodeProps } from 'react-qr-code'

import { toDataURL, toString } from 'qrcode'
import type { QRCodeRenderersOptions, QRCodeToStringOptions } from 'qrcode'
import styles from './index.module.css'

type QRCodeLevel = QRCodeProps['level']
type DownloadFormat = 'png' | 'jpeg' | 'webp' | 'svg'

interface State extends Pick<QRProps, 'text' | 'level' | 'fgColor' | 'bgColor' | 'format'> {
  autoSize: number
  useManualSize: boolean
  manualSize: number
  settingsOpen: boolean
}

const levels = ['L', 'M', 'Q', 'H'] as const satisfies readonly QRCodeLevel[]
const formats = ['svg', 'png', 'jpeg', 'webp'] as const satisfies readonly DownloadFormat[]

const DEFAULT_FG_COLOR = '#000000'
const DEFAULT_BG_COLOR = '#ffffff'
const DEFAULT_LEVEL = levels[0]
const DEFAULT_FORMAT = formats[0]
const DEFAULT_MANUAL_SIZE = 1000

const fieldLabelSx = {
  mb: 1,
  color: 'text.secondary',
  typography: 'body2',
} as const

const colorFieldInputProps = {
  sx: {
    height: 40,
    px: 1,
    py: 0.75,
    '& input': {
      cursor: 'pointer',
      p: 0,
      border: 0,
      borderRadius: 1,
    },
  },
} as const

export default class Home extends React.Component<object, State> {
  static QR_MIN_HEIGHT = 128

  static QR_MARGIN_HOR = 20

  static QR_MARGIN_VER = 5

  override state: State = {
    text: '',
    level: DEFAULT_LEVEL,
    format: DEFAULT_FORMAT,
    fgColor: DEFAULT_FG_COLOR,
    bgColor: DEFAULT_BG_COLOR,

    autoSize: 128,
    useManualSize: false,
    manualSize: DEFAULT_MANUAL_SIZE,
    settingsOpen: false,
  }

  storeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value
    this.setState({ text })
  }

  storeLevel = (_event: React.MouseEvent<HTMLElement>, level: QRCodeLevel | null) => {
    if (level === null) return
    this.setState({ level })
  }

  storeFormat = (_event: React.MouseEvent<HTMLElement>, format: DownloadFormat | null) => {
    if (format === null) return
    this.setState({ format })
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

  toggleSettings = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    this.setState((state) => ({ settingsOpen: !state.settingsOpen }))
  }

  resetSettings = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    this.setState({
      level: DEFAULT_LEVEL,
      format: DEFAULT_FORMAT,
      fgColor: DEFAULT_FG_COLOR,
      bgColor: DEFAULT_BG_COLOR,
      useManualSize: false,
      manualSize: DEFAULT_MANUAL_SIZE,
    })
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
    this.stopSizeTracking()
  }

  override componentDidUpdate = (_prevProps: object, prevState: State) => {
    // Recompute auto size when the form height changes (e.g. after layout shifts).
    if (prevState.useManualSize !== this.state.useManualSize) {
      this.updateSize()
    }
  }

  private sizeFrame = 0

  startSizeTracking = () => {
    cancelAnimationFrame(this.sizeFrame)
    const tick = () => {
      this.updateSize()
      this.sizeFrame = requestAnimationFrame(tick)
    }
    this.sizeFrame = requestAnimationFrame(tick)
  }

  stopSizeTracking = () => {
    cancelAnimationFrame(this.sizeFrame)
    this.sizeFrame = 0
    this.updateSize()
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
    if (size !== this.state.autoSize) {
      this.setState({ autoSize: size })
    }
  }

  private formRef = React.createRef<HTMLFormElement>()

  private codeRef = React.createRef<HTMLDivElement>()

  override render() {
    const {
      text, level, format, autoSize, manualSize, useManualSize, fgColor, bgColor, settingsOpen,
    } = this.state
    const displaySize = useManualSize ? manualSize : autoSize
    return (
      <Container maxWidth="md">
        <form noValidate onSubmit={this.preventDefault} autoComplete="off" ref={this.formRef}>
          <Card>
            <CardHeader title="QR Code Generator" subheader={<>
              Generate a QR Code.
              All data is generated locally and never leaves your device.
              Click the code to download.
            </>} />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  type="text"
                  label="Content"
                  value={text}
                  onChange={this.storeText}
                />

                <Stack direction="row" spacing={1} alignItems="center">
                  <Button onClick={this.toggleSettings}>
                    {settingsOpen ? 'Settings ▾' : 'Settings ▸'}
                  </Button>
                  {settingsOpen && (
                    <Button onClick={this.resetSettings}>
                      Reset
                    </Button>
                  )}
                </Stack>

                <Collapse
                  in={settingsOpen}
                  onEnter={this.startSizeTracking}
                  onEntered={this.stopSizeTracking}
                  onExit={this.startSizeTracking}
                  onExited={this.stopSizeTracking}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 2,
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      minWidth: 0,
                      pt: 1,
                    }}
                  >
                    <FormControl fullWidth sx={{ minWidth: 0, gridColumn: '1 / -1' }}>
                      <FormLabel sx={fieldLabelSx}>Error Correction Code Level</FormLabel>
                      <ToggleButtonGroup
                        exclusive
                        fullWidth
                        size="small"
                        color="primary"
                        value={level}
                        onChange={this.storeLevel}
                        aria-label="Error Correction Code Level"
                      >
                        {levels.map((l) => (
                          <ToggleButton key={`variant-${l}`} value={l}>
                            {l}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </FormControl>

                    <FormControl fullWidth sx={{ minWidth: 0 }}>
                      <FormLabel htmlFor="fg-color" sx={fieldLabelSx}>Foreground Color</FormLabel>
                      <TextField
                        id="fg-color"
                        type="color"
                        size="small"
                        value={fgColor}
                        onChange={this.storeFgColor}
                        InputProps={colorFieldInputProps}
                      />
                    </FormControl>

                    <FormControl fullWidth sx={{ minWidth: 0 }}>
                      <FormLabel htmlFor="bg-color" sx={fieldLabelSx}>Background Color</FormLabel>
                      <TextField
                        id="bg-color"
                        type="color"
                        size="small"
                        value={bgColor}
                        onChange={this.storeBgColor}
                        InputProps={colorFieldInputProps}
                      />
                    </FormControl>

                    <FormControl fullWidth sx={{ minWidth: 0 }}>
                      <FormLabel sx={fieldLabelSx}>Image Size</FormLabel>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                        <Switch
                          checked={useManualSize}
                          onChange={this.toggleManual}
                          inputProps={{ 'aria-label': 'Enable manual image size' }}
                        />
                        <TextField
                          type="number"
                          size="small"
                          fullWidth
                          value={Math.round(displaySize)}
                          onChange={this.storeManualSize}
                          disabled={!useManualSize}
                          inputProps={{ min: 1, 'aria-label': 'Image size in pixels' }}
                        />
                      </Stack>
                    </FormControl>

                    <FormControl fullWidth sx={{ minWidth: 0 }}>
                      <FormLabel sx={fieldLabelSx}>Download Format</FormLabel>
                      <ToggleButtonGroup
                        exclusive
                        fullWidth
                        size="small"
                        color="primary"
                        value={format}
                        onChange={this.storeFormat}
                        aria-label="Download format"
                      >
                        {formats.map((f) => (
                          <ToggleButton key={`format-${f}`} value={f}>
                            {f.toUpperCase()}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </FormControl>
                  </Box>
                </Collapse>
              </Stack>
            </CardContent>
          </Card>
        </form>

        <br />
        <div className={styles.qr} ref={this.codeRef}>
          {text !== '' && (
            <QRRender
              text={text}
              level={level}
              size={displaySize}
              fgColor={fgColor}
              bgColor={bgColor}
              format={format}
            />
          )}
        </div>
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
  format: DownloadFormat
}

interface QRState {
  key: string
  dataURLs?: Record<DownloadFormat, string>
}

class QRRender extends React.Component<QRProps, QRState> {
  override state: QRState = { key: '' }

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

    const png = await toDataURL(text, {
      errorCorrectionLevel: level,
      type: 'image/png',
      width: size,
      color: { dark: fgColor, light: bgColor },
    } as QRCodeRenderersOptions)

    const jpeg = await toDataURL(text, {
      errorCorrectionLevel: level,
      type: 'image/jpeg',
      width: size,
      quality: 1,
      color: { dark: fgColor, light: bgColor },
    } as QRCodeRenderersOptions)

    const webp = await toDataURL(text, {
      errorCorrectionLevel: level,
      type: 'image/webp',
      width: size,
      quality: 1,
      color: { dark: fgColor, light: bgColor },
    } as QRCodeRenderersOptions)

    const svgSource = await qrToString(text, {
      errorCorrectionLevel: level,
      type: 'svg',
      width: size,
      color: { dark: fgColor, light: bgColor },
    })
    const svg = `data:image/svg+xml;base64,${btoa(svgSource)}`

    if (!this.mounted) return
    this.setState({ dataURLs: { png, jpeg, webp, svg } })
  }

  override componentDidMount() {
    this.mounted = true
    void this.updateCodeState()
  }

  override componentDidUpdate(prevProps: QRProps) {
    const key = QRRender.getKey(this.props)
    const prevKey = QRRender.getKey(prevProps)

    if (key === prevKey) return
    void this.updateCodeState()
  }

  override render() {
    const { text, level, size, fgColor, bgColor, format } = this.props
    const { key } = this.state
    let { dataURLs } = this.state
    if (QRRender.getKey(this.props) !== key) {
      dataURLs = undefined
    }

    const code = <QRCode value={text} level={level} size={size} fgColor={fgColor} bgColor={bgColor} />
    if (dataURLs !== undefined) {
      return (
        <a href={dataURLs[format]} target="_blank" rel="noreferrer" download={`qr.${format}`}>
          {code}
        </a>
      )
    }
    return code
  }
}

function qrToString(text: string, options: QRCodeToStringOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    toString(text, options, (error, string) => {
      if (error) {
        reject(error)
      } else {
        resolve(string)
      }
    })
  })
}
// spellchecker:words qrcode
