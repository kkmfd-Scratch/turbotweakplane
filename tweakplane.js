class TweakpaneExtension {
  constructor(runtime) {
    this.runtime = runtime;
    this.panes = {};
    this.tweakpaneReady = false;
    this.eventValues = {}; // Store event values

    this.loadTweakpane();
  }

  loadTweakpane() {
    if (window.Tweakpane) {
      this.tweakpaneReady = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tweakpane@3.0.7/dist/tweakpane.min.js';
    script.onload = () => {
      console.log('Tweakpane loaded!');
      this.tweakpaneReady = true;
    };
    script.onerror = () => {
      console.error('Failed to load Tweakpane');
    };
    document.head.appendChild(script);
  }

  getInfo() {
    return {
      id: 'tweakpane',
      name: 'Tweakpane UI',
      blocks: [
        {
          opcode: 'createPanel',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Create expandable panel [ID] with title [TITLE] at X: [X] Y: [Y]',
          arguments: {
            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'myPanel' },
            TITLE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Settings' },
            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
          },
        },
        {
          opcode: 'removeAllPanels',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Remove all panels',
        },
        {
          opcode: 'addSlider',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Add slider to [ID] labeled [LABEL] min [MIN] max [MAX]',
          arguments: {
            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'myPanel' },
            LABEL: { type: Scratch.ArgumentType.STRING, defaultValue: 'Speed' },
            MIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            MAX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
          },
        },
        {
          opcode: 'addButton',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Add button to [ID] labeled [LABEL]',
          arguments: {
            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'myPanel' },
            LABEL: { type: Scratch.ArgumentType.STRING, defaultValue: 'Click Me' },
          },
        },
        {
          opcode: 'whenButtonPressed',
          blockType: Scratch.BlockType.HAT,
          text: 'When button [LABEL] is pressed',
          arguments: {
            LABEL: { type: Scratch.ArgumentType.STRING, defaultValue: 'Click Me' },
          },
        },
        {
          opcode: 'whenSliderChanged',
          blockType: Scratch.BlockType.HAT,
          text: 'When slider [LABEL] is changed',
          arguments: {
            LABEL: { type: Scratch.ArgumentType.STRING, defaultValue: 'Speed' },
          },
        },
        {
          opcode: 'getSliderValue',
          blockType: Scratch.BlockType.REPORTER,
          text: 'Value of slider [LABEL]',
          arguments: {
            LABEL: { type: Scratch.ArgumentType.STRING, defaultValue: 'Speed' },
          },
        },
      ],
    };
  }

  createPanel(args) {
    if (!this.tweakpaneReady || !window.Tweakpane) {
      console.warn('Tweakpane is not ready yet!');
      return;
    }

    const { ID, TITLE, X, Y } = args;
    if (this.panes[ID]) return; // Prevent duplicate panels

    const pane = new window.Tweakpane.Pane();
    pane.element.style.position = 'absolute';
    pane.element.style.left = `${X}px`;
    pane.element.style.top = `${Y}px`;

    const stage = document.querySelector('.stage_stage_1fD7k');
    if (stage) {
      stage.appendChild(pane.element);
    } else {
      document.body.appendChild(pane.element);
    }

    const folder = pane.addFolder({
      title: TITLE,
    });

    this.panes[ID] = { pane, folder };
  }

  addSlider(args) {
    const { ID, LABEL, MIN, MAX } = args;
    const panel = this.panes[ID];
    if (!panel) return;

    const slider = panel.folder.addBlade({
      view: 'slider',
      label: LABEL,
      min: MIN,
      max: MAX,
      value: (MIN + MAX) / 2,
    });

    this.eventValues[LABEL] = (MIN + MAX) / 2;

    slider.on('change', (event) => {
      this.eventValues[LABEL] = event.value;
      setTimeout(() => {
        this.runtime.startHats('tweakpane_whenSliderChanged', {
          LABEL,
        });
      }, 0);
    });
  }

  addButton(args) {
    const { ID, LABEL } = args;
    const panel = this.panes[ID];
    if (!panel) return;

    const button = panel.folder.addButton({
      title: LABEL,
    });

    button.on('click', () => {
      setTimeout(() => {
        this.runtime.startHats('tweakpane_whenButtonPressed', {
          LABEL,
        });
      }, 0);
    });
  }

  removeAllPanels() {
    Object.keys(this.panes).forEach((panelID) => {
      const { pane } = this.panes[panelID];
      if (pane) {
        pane.element.remove();
      }
    });
    this.panes = {};
    console.log('All panels removed!');
  }

  whenButtonPressed() {
    // Event fires automatically when the button is pressed
  }

  whenSliderChanged() {
    // Event fires automatically when the slider value changes
  }

  getSliderValue(args) {
    return this.eventValues[args.LABEL] || 0;
  }
}

Scratch.extensions.register(new TweakpaneExtension());
