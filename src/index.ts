import dotenv from "dotenv"
import { IConfigComponent } from "@well-known-components/interfaces"

// this is an attempt to monads
async function getFromMap<T>(key: string | any, map: Record<string, any>) {
  if (map.hasOwnProperty(key)) {
    return map[key]
  }
  return undefined
}

/**
 * Creates a composed config provider, using the provided order, getting configurations
 * will cascade to the next provider if the result is undefined
 * @public
 */
export function composeConfigProviders(...providers: IConfigComponent[]): IConfigComponent {
  return {
    async getString(name) {
      for (const provider of providers) {
        const value = await provider.getString(name)

        if (value !== undefined) return value
      }

      return undefined
    },
    async getNumber(name) {
      for (const provider of providers) {
        const value = await provider.getNumber(name)

        if (value !== undefined) return value
      }

      return undefined
    },
    async requireString(name) {
      for (const provider of providers) {
        const value = await provider.getString(name)

        if (value !== undefined) return value
      }

      throw new Error("Configuration: string " + name + " is required")
    },
    async requireNumber(name) {
      for (const provider of providers) {
        const value = await provider.getNumber(name)

        if (value !== undefined) return value
      }

      throw new Error("Configuration: string " + name + " is required")
    },
  }
}

/**
 * Creates a simple configuration provider out of a dictionary (process.env)
 * @public
 * @param optionMap - a dictionary to search values, usually process.env
 * @param defaultValues - default values
 */
export function createConfigComponent(
  optionMap: Partial<Record<string, string>>,
  defaultValues?: Partial<Record<string, string>>
): IConfigComponent {
  const config = createRecordConfigComponent(optionMap)

  if (defaultValues) {
    return composeConfigProviders(config, createRecordConfigComponent(defaultValues))
  }

  return config
}

/**
 * Creates a simple configuration provider out of a dictionary (process.env)
 * @public
 * @param optionMap - a dictionary to search values, usually process.env
 */
export function createRecordConfigComponent(optionMap: Partial<Record<string, string>>): IConfigComponent {
  return {
    async getString(name) {
      const value = await getFromMap(name, optionMap)

      if (typeof value !== "string" && value !== undefined) {
        throw new Error(`Configuration: config "${name}" should be a string, got ${typeof value} instead`)
      }

      return value
    },
    async getNumber(name) {
      const value = await getFromMap(name, optionMap)

      if (value != undefined && value !== null) {
        const numValue = parseFloat(value)

        if (isNaN(numValue)) {
          throw new Error(`Configuration: config "${name}" should be a number, got ${typeof value} (${value}) instead`)
        }

        return numValue
      }

      return undefined
    },
    async requireString(name) {
      const r = await this.getString(name)

      if (r === undefined) {
        throw new Error("Configuration: string " + name + " is required")
      }

      return r
    },
    async requireNumber(name) {
      const r = await this.getNumber(name)

      if (r === undefined) {
        throw new Error("Configuration: number " + name + " is required")
      }

      return r
    },
  }
}

/**
 * Creates a simple configuration provider out of a dictionary (process.env)
 * All previously existing environment variables will not be replaced by the
 * .env contents.
 *
 * "path" can be an array of strings, the values will be overwritten
 * in the order of parsing
 *
 * @public
 * @param options - configurations for the .env file
 * @param defaultValues - default values
 */
export async function createDotEnvConfigComponent(
  options: {
    /// file containing environment variables is located
    path?: string | string[]
    /// encoding
    encoding?: string
    // print debug information in case something happens while loading and parsing the .env file
    debug?: boolean
  },
  defaultValues?: Partial<Record<string, string>>
): Promise<IConfigComponent> {
  const paths = Array.isArray(options.path) ? options.path : [options.path || ".env"]
  const initialSetOfKeys = new Set(Object.keys(process.env))

  const parsedValues: Record<string, string> = {}

  for (const path of paths) {
    if (options.debug) {
      console.log(`loading path ${path}`)
    }

    const { error, parsed } = dotenv.config({ ...options, path })

    if (error) {
      console.warn(`Warning[createDotEnvConfigComponent]: ${error}`)
    }

    if (parsed) {
      Object.assign(parsedValues, parsed)
    }
  }

  for (let [key, value] of Object.entries(parsedValues)) {
    if (initialSetOfKeys.has(key)) {
      if (options.debug) {
        console.log(`Env var ${key} is present. Skipping .env override`)
      }
    } else {
      process.env[key] = value
    }
  }

  return createConfigComponent(process.env, defaultValues)
}
