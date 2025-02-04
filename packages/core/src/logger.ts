import chalk, { type ChalkInstance } from 'chalk';
import figlet from 'figlet';

type U = unknown[];

type Color = keyof Pick<
  ChalkInstance,
  'blueBright' | 'cyan' | 'white' | 'green'
>;

const CHALK_MAP: { [color in Color]: ChalkInstance } = {
  blueBright: chalk.blueBright,
  cyan: chalk.cyan,
  white: chalk.white,
  green: chalk.green,
} as const;

type LoggerOptions = {
  primary: Color;
  secondary: Color;
  name?: string;
  includeName?: boolean;
};

class Logger {
  primaryColor: ChalkInstance;
  secondaryColor: ChalkInstance;
  name: string;
  includeName: boolean = true;

  statusLogBaseColor: ChalkInstance = chalk.bold.italic;
  successColor: ChalkInstance = chalk.greenBright;
  infoColor: ChalkInstance = chalk.cyanBright;
  warningColor: ChalkInstance = chalk.yellowBright;
  errorColor: ChalkInstance = chalk.redBright;

  constructor({
    primary,
    secondary,
    name = '',
    includeName = true,
  }: LoggerOptions) {
    this.primaryColor = CHALK_MAP[primary];
    this.secondaryColor = CHALK_MAP[secondary];
    this.name = name;
    this.includeName = includeName;
  }

  log(...args: U) {
    if (!!this.includeName) {
      console.log(this.primaryColor(this.name), args.join(' '));
    } else {
      console.log(args.join(' '));
    }

    return this;
  }

  success(...args: U) {
    return this.log(this.successColor('Success - '), ...args);
  }

  info(...args: U) {
    return this.log(this.infoColor('Info - '), ...args);
  }

  warn(...args: U) {
    return this.log(this.warningColor('Warn - '), ...args);
  }

  error(...args: U) {
    return this.log(this.errorColor('Error - '), ...args);
  }

  title(...args: U) {
    const text = figlet.textSync(args.join(' '), {
      font: 'Small',
      width: process.stdout?.columns || 80,
      horizontalLayout: 'fitted',
    });

    console.log(this.primaryColor(text));
    return this;
  }

  break() {
    console.log('');
  }

  primary(...args: U) {
    console.log(this.primaryColor(args.join(' ')));
  }

  secondary(...args: U) {
    console.log(this.secondaryColor(args.join(' ')));
  }

  setPrimaryColor(color: Color) {
    this.primaryColor = CHALK_MAP[color];
    return this;
  }

  setSecondaryColor(color: Color) {
    this.secondaryColor = CHALK_MAP[color];
    return this;
  }

  setName(name: string = '') {
    this.name = name;
    return this;
  }
}

export { type Color, type LoggerOptions, Logger };
