## API Report File for "@well-known-components/env-config-provider"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { IConfigComponent } from '@well-known-components/interfaces';

// @public
export function composeConfigProviders(...providers: IConfigComponent[]): IConfigComponent;

// @public
export function createConfigComponent(optionMap: Partial<Record<string, string>>, defaultValues?: Partial<Record<string, string>>): IConfigComponent;

// @public
export function createDotEnvConfigComponent(options: {
    path?: string | string[];
    encoding?: string;
    debug?: boolean;
}, defaultValues?: Partial<Record<string, string>>): Promise<IConfigComponent>;

// @public
export function createRecordConfigComponent(optionMap: Partial<Record<string, string>>): IConfigComponent;

// (No @packageDocumentation comment for this package)

```
