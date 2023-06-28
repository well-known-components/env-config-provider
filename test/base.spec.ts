import { createConfigComponent, createDotEnvConfigComponent } from "../src/index"

describe("basic test cases to make sure we are not breaking things too much", function () {
  it("fails on missing keys", async function () {
    const config = createConfigComponent({ xyz: "asd" })

    await new Promise((ok, err) => {
      // watch out! this is a negative test. err and ok are flipped,
      // so the test passess when the promise fails
      config.requireString("test").then(err, ok)
    })

    await new Promise((ok, err) => {
      // watch out! this is a negative test. err and ok are flipped,
      // so the test passess when the promise fails
      config.requireNumber("test").then(err, ok)
    })
  })

  it("returns string", async function () {
    const config = createConfigComponent({ xyz: "asd" })
    expect(await config.requireString("xyz")).toEqual("asd")
    expect(await config.getString("xyz")).toEqual("asd")
  })

  it("returns number", async function () {
    const config = createConfigComponent({ xyz: "123" })
    expect(await config.getNumber("xyz")).toEqual(123)
    expect(await config.requireNumber("xyz")).toEqual(123)
  })

  it("returns default string", async function () {
    const config = createConfigComponent({}, { xyz: "asd" })
    expect(await config.requireString("xyz")).toEqual("asd")
    expect(await config.getString("xyz")).toEqual("asd")
  })

  it("returns default number", async function () {
    const config = createConfigComponent({ abc: "123" }, { xyz: "123" })
    expect(await config.getNumber("xyz")).toEqual(123)
    expect(await config.requireNumber("xyz")).toEqual(123)
  })

  it("loads a .env and gets a number", async function () {
    const config = await createDotEnvConfigComponent({})
    expect(await config.requireNumber("TEST_222")).toEqual(1)
  })

  it("loads a .env and gets a default value", async function () {
    const config = await createDotEnvConfigComponent({}, { xyz: "a" })
    expect(await config.requireString("xyz")).toEqual("a")
  })

  it("loads a .env with custom path and gets a value", async function () {
    const config = await createDotEnvConfigComponent({ path: "test/.sub-env" }, {})
    expect(await config.requireString("SUB_TEST")).toEqual("bbb")
  })

  it("loads a .env and keeps the values of process.env", async function () {
    process.env.TEST_OLD = "xyz123"
    const config = await createDotEnvConfigComponent({}, {})
    expect(await config.requireString("TEST_OLD")).toEqual("xyz123")
  })

  it("loads several config files and overrides the values", async function () {
    process.env = {}
    process.env.TEST_222 = "value"
    const config = await createDotEnvConfigComponent({ path: [".env.defaults", ".env"], debug: true }, {})

    expect(await config.requireString("TEST_222")).toEqual("value")
    expect(await config.requireString("TEST_333")).toEqual("1")
    expect(await config.requireString("TEST_REPLACING_DEFAULT")).toEqual("123")
    expect(await config.requireString("TEST_ONLY_DEFAULT")).toEqual("1")
  })
})
