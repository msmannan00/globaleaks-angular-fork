import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import * as Flow from "@flowjs/flow.js";
import { AuthenticationService } from "@app/services/authentication.service";
import { SubmissionService } from "@app/services/submission.service";

@Component({
  selector: "src-voice-recorder",
  templateUrl: "./voice-recorder.component.html"
})
export class VoiceRecorderComponent implements OnInit {
  @Input() uploads: any;
  @Input() field: any;
  @Input() fileUploadUrl: any;
  @Input() entryIndex: any;
  @Input() fieldEntry: any;
  _fakeModel: any;
  fileInput: any;
  seconds: number = 0;
  activeButton: string | null = null;
  isRecording: boolean = false;
  audioPlayer: string | null = null;
  mediaRecorder: MediaRecorder | null = null;
  context: AudioContext = new AudioContext();
  mediaStreamDestination: MediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(this.context);
  recorder: MediaRecorder = new MediaRecorder(this.mediaStreamDestination.stream);
  recording_blob: any = null;
  flow: Flow;
  secondsTracker: any = null;
  startTime: number;
  stopButton: boolean;
  recordButton: boolean;
  chunks: never[];
 
  @Output() notifyFileUpload: EventEmitter<any> = new EventEmitter<any>();
  private audioContext: AudioContext;
  entry: any;
  constructor(private cd: ChangeDetectorRef, protected authenticationService: AuthenticationService, private submissionService: SubmissionService) {
  }

  ngOnInit(): void {
    this.fileInput = this.field ? this.field.id : "status_page";
    this.uploads[this.fileInput] = { files: [] };
    this.initAudioContext()
  }
  private initAudioContext() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  triggerRecording(fileId: string): void {
    this.activeButton = "record";

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          this.startRecording(fileId, stream);
        })
        .catch(() => {
          this.activeButton = null;
        });
    }
  }

  startRecording = async (fileId: string, stream: MediaStream) => {
    this.isRecording = true;
    this.audioPlayer = '';
    this.activeButton = 'record';
    this.seconds = 0;
    this.startTime = Date.now();

    this.flow = new Flow({
      target: this.fileUploadUrl,
      speedSmoothingFactor: 0.01,
      singleFile: this.field !== undefined && !this.field.multi_entry,
      allowDuplicateUploads: false,
      testChunks: false,
      permanentErrors: [500, 501],
      headers: { "X-Session": this.authenticationService.session.id },
      query: {
        type: "audio.webm",
        reference_id: fileId,
      },
    });

    this.secondsTracker = setInterval(() => {
      this.seconds += 1;
      if (this.seconds > parseInt(this.field.attrs.max_len.value)) {
        this.isRecording = false;
        clearInterval(this.secondsTracker);
        this.secondsTracker = null;
        this.stopRecording();
      }
    }, 1000);


    const mediaStreamDestination = this.audioContext.createMediaStreamDestination();
    const source = this.audioContext.createMediaStreamSource(stream);
    const anonymizationFilter = this.anonymizeSpeaker(this.audioContext);

    source.connect(anonymizationFilter.input);
    anonymizationFilter.output.connect(mediaStreamDestination);

    source.connect(anonymizationFilter.input);
    anonymizationFilter.output.connect(mediaStreamDestination);

    const recorder = new MediaRecorder(mediaStreamDestination.stream);
    recorder.onstop = this.onRecorderStop.bind(this);
    recorder.ondataavailable = this.onRecorderDataAvailable.bind(this);
    recorder.start();

    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.onstop = () => {
      recorder.stop();
    };

    this.mediaRecorder.start();
  };

  onRecorderDataAvailable = (e: BlobEvent) => {
    this.recording_blob = e.data;
    this.recording_blob.name = "audio.webm";
    this.recording_blob.relativePath = "audio.webm";
  };

  async stopRecording(): Promise<void> {

    if (this.mediaRecorder) {
      const tracks = this.mediaRecorder.stream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
      this.mediaRecorder.stop();
    }
    this.isRecording = false;
    this.recordButton = false;
    this.stopButton = true;
    this.activeButton = null;
    clearInterval(this.secondsTracker);
    this.secondsTracker = null;

    if (this.seconds < this.field.attrs.min_len.value) {
      this.deleteRecording();
      return;
    }

    if (this.mediaRecorder && (this.mediaRecorder.state === 'recording' || this.mediaRecorder.state === 'paused')) {
      this.mediaRecorder.stop();
    }
  }
 
  async onRecorderStop() : Promise<void> {
    this.flow.files = [];

    if (this.uploads.hasOwnProperty(this.fileInput)) {
      delete this.uploads[this.fileInput];
    }

    if (this.seconds >= parseInt(this.field.attrs.min_len.value) && this.seconds <= parseInt(this.field.attrs.max_len.value)) {
    
      this.flow.addFile(this.recording_blob);

      this.audioPlayer = URL.createObjectURL(this.recording_blob)
      this.uploads[this.fileInput] = this.flow;
      this.submissionService.setSharedData(this.flow);
      if (this.entry) {
        if (!this.entry.files) {
          this.entry.files = [];
        }
        this.entry.files.push(this.recording_blob.uniqueIdentifier);
      }
    }
    this.cd.detectChanges();
  }

  deleteRecording(): void {
    if (this.flow) {
      this.flow = new Flow
    }
    this.chunks = [];
    this.mediaRecorder = null;
    this.seconds = 0;
    this.audioPlayer = null;
    this.submissionService.setSharedData(null);
    delete this.uploads[this.fileInput];
    if (this.entry && this.entry.files) {
      delete this.entry.files;
    }
  }

  async enableNoiseSuppression(stream: MediaStream): Promise<void> {
    const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    if ("noiseSuppression" in supportedConstraints) {
      const settings = { noiseSuppression: true };
      stream.getAudioTracks().forEach(track => {
        track.applyConstraints(settings);
      });
    }
  }

  private generateVocoderBands(startFreq: number, endFreq: number, numBands: number): { freq: number; Q: number }[] {
    const vocoderBands: { freq: number; Q: number }[] = [];
    const logStep: number = Math.log(endFreq / startFreq) / (numBands - 1);

    for (let i = 0; i < numBands; i++) {
      const lo: number = startFreq * Math.exp(i * logStep);
      const hi: number = startFreq * Math.exp((i + 1) * logStep);
      const fc: number = (hi + lo) / 2;
      const bw: number = hi - lo;
      const Q: number = fc / bw;

      vocoderBands.push({ freq: fc, Q: Q });
    }

    return vocoderBands;
  }

  private generateRectifierCurve(): Float32Array {
    const rectifierCurve = new Float32Array(65536);
    for (let i = -32768; i < 32768; i++)
      rectifierCurve[i + 32768] = ((i > 0) ? i : -i) / 32768;
    return rectifierCurve;
  }

  public anonymizeSpeaker(audioContext: any): any {
    const input: GainNode = audioContext.createGain();
    const output: GainNode = audioContext.createGain();
    input.gain.value = output.gain.value = 1;
    const vocoderBands = this.generateVocoderBands(200, 16000, 128);
    const vocoderPitchShift: number = -(1 / 12 - Math.random() * 1 / 24);

    for (let i = 0; i < vocoderBands.length; i++) {
      const carrier: OscillatorNode = audioContext.createOscillator();
      carrier.frequency.value = vocoderBands[i].freq * Math.pow(2, vocoderPitchShift);
      const modulatorBandFilter: BiquadFilterNode = audioContext.createBiquadFilter();
      modulatorBandFilter.type = 'bandpass';
      modulatorBandFilter.frequency.value = vocoderBands[i].freq;
      modulatorBandFilter.Q.value = vocoderBands[i].Q;
      const rectifier: WaveShaperNode = audioContext.createWaveShaper();
      rectifier.curve = this.generateRectifierCurve();
      const postRectifierBandFilter: BiquadFilterNode = audioContext.createBiquadFilter();
      postRectifierBandFilter.type = 'lowpass';
      postRectifierBandFilter.frequency.value = 20;
      postRectifierBandFilter.gain.value = 1;
      const postRectifierGain: GainNode = audioContext.createGain();
      postRectifierGain.gain.value = 1;
      const bandGain: GainNode = audioContext.createGain();
      bandGain.gain.value = 0;
      input.connect(modulatorBandFilter);
      modulatorBandFilter.connect(rectifier);
      rectifier.connect(postRectifierGain);
      postRectifierGain.connect(bandGain.gain);

      if (carrier) carrier.connect(bandGain);
      if (bandGain) bandGain.connect(output);

      if (carrier) carrier.start();
    }
    return { input: input, output: output };
  }


}

