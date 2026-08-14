import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { createField, deriveFieldItem } from "../create-field";
import type { CreateFieldProps, CreateFieldReturn } from "../field.types";

/** `createUniqueId()` needs an owner, so every field is built under a root the test disposes. */
function owned<T>(create: () => T): { value: T; dispose: () => void } {
  let dispose!: () => void;
  const value = createRoot((disposeRoot) => {
    dispose = disposeRoot;
    return create();
  });
  return { value, dispose };
}

function withField(props: CreateFieldProps, assert: (field: CreateFieldReturn) => void): void {
  const { value, dispose } = owned(() => createField(props));
  try {
    assert(value);
  } finally {
    dispose();
  }
}

describe("createField", () => {
  describe("ids", () => {
    it("derives all five from the field's own id", () => {
      withField({ id: "email" }, (field) => {
        expect(field.ids).toMatchObject({
          root: "field::email",
          control: "email",
          label: "field::email::label",
          helperText: "field::email::helper-text",
          errorText: "field::email::error-text",
        });
      });
    });

    it("generates an id when none is passed, and every part carries the same one", () => {
      withField({}, (field) => {
        expect(field.ids.control).not.toBe("");
        expect(field.ids.root).toBe(`field::${field.ids.control}`);
        expect(field.ids.label).toBe(`field::${field.ids.control}::label`);
      });
    });

    it("lets `ids` override each one individually", () => {
      const ids = {
        root: "r",
        control: "c",
        label: "l",
        helperText: "h",
        errorText: "e",
      };

      withField({ id: "email", ids }, (field) => {
        expect(field.ids).toMatchObject(ids);
        expect(field.getRootProps().id).toBe("r");
        expect(field.getLabelProps().id).toBe("l");
        expect(field.getControlProps().id).toBe("c");
        expect(field.getHelperTextProps().id).toBe("h");
        expect(field.getErrorTextProps().id).toBe("e");
      });
    });

    it("overrides one id without disturbing the other four", () => {
      withField({ id: "email", ids: { label: "custom-label" } }, (field) => {
        expect(field.ids).toMatchObject({
          root: "field::email",
          control: "email",
          label: "custom-label",
          helperText: "field::email::helper-text",
          errorText: "field::email::error-text",
        });
      });
    });
  });

  describe("label", () => {
    it("points `for` at the control", () => {
      withField({ id: "email" }, (field) => {
        expect(field.getLabelProps().for).toBe("email");
      });
    });

    it("points `for` at an overridden control id", () => {
      withField({ id: "email", ids: { control: "c" } }, (field) => {
        expect(field.getLabelProps().for).toBe("c");
      });
    });

    it("points `for` at the targeted item's control instead", () => {
      withField({ id: "email", target: "work" }, (field) => {
        expect(field.getLabelProps().for).toBe("field::email::item::work");
        expect(field.getControlProps().id).toBe("email");
      });
    });
  });

  describe("aria-describedby", () => {
    it("is absent until a helper text registers, and gone again once it unregisters", () => {
      withField({ id: "email" }, (field) => {
        expect(field.getControlProps()["aria-describedby"]).toBeUndefined();

        flush(() => field.registerHelperText("field::email::helper-text"));
        expect(field.getControlProps()["aria-describedby"]).toBe("field::email::helper-text");

        flush(() => field.registerHelperText(undefined));
        expect(field.getControlProps()["aria-describedby"]).toBeUndefined();
      });
    });

    it("does not depend on `invalid`, unlike the error message", () => {
      withField({ id: "email", invalid: true }, (field) => {
        flush(() => field.registerHelperText("h"));
        expect(field.getControlProps()["aria-describedby"]).toBe("h");
      });
    });
  });

  describe("aria-errormessage", () => {
    it("needs a registered error text as well as `invalid`", () => {
      const [invalid, setInvalid] = createSignal(false);

      withField(
        {
          id: "email",
          get invalid() {
            return invalid();
          },
        },
        (field) => {
          flush(() => field.registerErrorText("field::email::error-text"));
          expect(field.getControlProps()["aria-errormessage"]).toBeUndefined();

          flush(() => setInvalid(true));
          expect(field.getControlProps()["aria-errormessage"]).toBe("field::email::error-text");

          flush(() => field.registerErrorText(undefined));
          expect(field.getControlProps()["aria-errormessage"]).toBeUndefined();
        },
      );
    });

    it("stays absent while invalid with no error text rendered", () => {
      withField({ id: "email", invalid: true }, (field) => {
        expect(field.getControlProps()["aria-errormessage"]).toBeUndefined();
      });
    });
  });

  describe("state", () => {
    it("defaults the four states to false, and a forwarded `undefined` does not delete that", () => {
      withField(
        { id: "email", invalid: undefined, disabled: undefined, readOnly: undefined },
        (field) => {
          expect(field.invalid).toBe(false);
          expect(field.disabled).toBe(false);
          expect(field.readOnly).toBe(false);
          expect(field.required).toBe(false);

          expect(field.getControlProps()).toMatchObject({
            required: false,
            disabled: false,
            readonly: false,
            "aria-invalid": undefined,
            "data-invalid": undefined,
            "data-required": undefined,
            "data-readonly": undefined,
          });
          expect(field.getRootProps()).toMatchObject({
            "data-disabled": undefined,
            "data-invalid": undefined,
            "data-readonly": undefined,
          });
        },
      );
    });

    it("writes the on state as Chakra's `dataAttr` and `ariaAttr`", () => {
      withField(
        { id: "email", invalid: true, disabled: true, readOnly: true, required: true },
        (field) => {
          expect(field.getControlProps()).toMatchObject({
            required: true,
            disabled: true,
            readonly: true,
            "aria-invalid": "true",
            "data-invalid": "",
            "data-required": "",
            "data-readonly": "",
          });
          expect(field.getRootProps()).toMatchObject({
            "data-disabled": "",
            "data-invalid": "",
            "data-readonly": "",
          });
          expect(field.getLabelProps()).toMatchObject({
            "data-disabled": "",
            "data-invalid": "",
            "data-readonly": "",
            "data-required": "",
          });
          expect(field.getHelperTextProps()["data-disabled"]).toBe("");
        },
      );
    });

    it("re-reads a changed `invalid` and `required` through the getters", () => {
      const [invalid, setInvalid] = createSignal(false);
      const [required, setRequired] = createSignal(false);

      withField(
        {
          id: "email",
          get invalid() {
            return invalid();
          },
          get required() {
            return required();
          },
        },
        (field) => {
          expect(field.getControlProps()["aria-invalid"]).toBeUndefined();
          expect(field.getLabelProps()["data-required"]).toBeUndefined();

          flush(() => {
            setInvalid(true);
            setRequired(true);
          });

          expect(field.invalid).toBe(true);
          expect(field.required).toBe(true);
          expect(field.getControlProps()).toMatchObject({
            "aria-invalid": "true",
            "data-invalid": "",
            required: true,
            "data-required": "",
          });
          expect(field.getLabelProps()["data-required"]).toBe("");
          expect(field.getRootProps()["data-invalid"]).toBe("");
        },
      );
    });
  });

  describe("parts", () => {
    it("scopes every part, kebab-casing the three compound names", () => {
      withField({ id: "email" }, (field) => {
        expect(field.getRootProps()).toMatchObject({ "data-scope": "field", "data-part": "root" });
        expect(field.getLabelProps()["data-part"]).toBe("label");
        expect(field.getInputProps()["data-part"]).toBe("input");
        expect(field.getTextareaProps()["data-part"]).toBe("textarea");
        expect(field.getSelectProps()["data-part"]).toBe("select");
        expect(field.getHelperTextProps()["data-part"]).toBe("helper-text");
        expect(field.getErrorTextProps()["data-part"]).toBe("error-text");
      });
    });

    it("leaves the required indicator unscoped, as the React version's is", () => {
      // The one part Chakra hand-writes rather than taking from Ark, so the pair Ark would have
      // supplied never reaches the DOM there either.
      withField({ id: "email" }, (field) => {
        expect(field.getRequiredIndicatorProps()).toEqual({ "aria-hidden": "true" });
      });
    });

    it("gives the three control flavours the control contract", () => {
      withField({ id: "email", required: true }, (field) => {
        for (const control of [
          field.getInputProps(),
          field.getTextareaProps(),
          field.getSelectProps(),
        ]) {
          expect(control).toMatchObject({ id: "email", required: true, "data-required": "" });
        }
      });
    });

    it("announces the error text politely, and hides the required indicator", () => {
      withField({ id: "email" }, (field) => {
        expect(field.getErrorTextProps()["aria-live"]).toBe("polite");
        expect(field.getRequiredIndicatorProps()["aria-hidden"]).toBe("true");
      });
    });

    it('gives the root `role="group"`', () => {
      withField({ id: "email" }, (field) => {
        expect(field.getRootProps().role).toBe("group");
      });
    });
  });

  describe("items", () => {
    it("derives the item ids off the control id", () => {
      withField({ id: "email" }, (field) => {
        expect(field.getItemIds("work")).toEqual({
          control: "field::email::item::work",
          label: "field::email::item::work::label",
        });
      });
    });

    it("re-points an item's ids and its label at its own control", () => {
      withField({ id: "email", invalid: true }, (field) => {
        const item = deriveFieldItem(field, () => "work");

        expect(item.ids.control).toBe("field::email::item::work");
        expect(item.ids.label).toBe("field::email::item::work::label");
        expect(item.getLabelProps()).toMatchObject({
          id: "field::email::item::work::label",
          for: "field::email::item::work",
          "data-invalid": "",
        });
        expect(item.getControlProps().id).toBe("field::email::item::work");
        expect(item.getInputProps()).toMatchObject({
          id: "field::email::item::work",
          "data-part": "input",
          "aria-invalid": "true",
        });
      });
    });

    it("leaves the texts' ids alone, since an item shares them with the field", () => {
      withField({ id: "email" }, (field) => {
        const item = deriveFieldItem(field, () => "work");

        expect(item.ids.root).toBe("field::email");
        expect(item.ids.helperText).toBe("field::email::helper-text");
        expect(item.ids.errorText).toBe("field::email::error-text");
      });
    });

    it("tracks a changing item value rather than snapshotting it", () => {
      const [value, setValue] = createSignal("work");

      withField({ id: "email" }, (field) => {
        const item = deriveFieldItem(field, value);
        expect(item.ids.control).toBe("field::email::item::work");

        flush(() => setValue("home"));

        expect(item.ids.control).toBe("field::email::item::home");
        expect(item.getLabelProps().for).toBe("field::email::item::home");
      });
    });

    it("reads the field's state live, so a later `invalid` reaches the item", () => {
      const [invalid, setInvalid] = createSignal(false);

      withField(
        {
          id: "email",
          get invalid() {
            return invalid();
          },
        },
        (field) => {
          const item = deriveFieldItem(field, () => "work");
          expect(item.getControlProps()["aria-invalid"]).toBeUndefined();

          flush(() => setInvalid(true));

          expect(item.getControlProps()["aria-invalid"]).toBe("true");
        },
      );
    });
  });
});
