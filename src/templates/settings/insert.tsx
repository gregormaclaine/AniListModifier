import { createSignal, For } from 'solid-js';
import {
  update as update_setting,
  get as get_settings,
  log
} from '../../content/settings';
import { ExtensionSettings } from '../../settings';

const CheckBox = (props: {
  value: boolean;
  label: string;
  toggle: () => void;
}) => {
  const [checked, set_checked] = createSignal(props.value);

  function onChange() {
    props.toggle();
    set_checked(v => !v);
  }

  return (
    <div class='option' style='margin-bottom: 14px'>
      <label
        role='checkbox'
        class={'el-checkbox' + (checked() ? ' is-checked' : '')}
        aria-checked={checked() ? 'true' : 'false'}
      >
        <span
          aria-checked='mixed'
          class={'el-checkbox__input' + (checked() ? ' is-checked' : '')}
        >
          <span class='el-checkbox__inner'></span>
          <input
            type='checkbox'
            aria-hidden='true'
            class='el-checkbox__original'
            value=''
            onChange={onChange}
          />
        </span>
        <span class='el-checkbox__label'>{props.label}</span>
      </label>
    </div>
  );
};

function Radio<T extends string>(props: {
  options: { value: Exclude<T, Function>; label: string; desc: string }[];
  value: T;
  on_change: (value: T) => void;
}) {
  const [active, set_active] = createSignal(props.value);

  return (
    <div style='margin: 1em 0;'>
      <For each={props.options}>
        {({ value, label, desc }) => (
          <div style='margin-bottom: 20px'>
            <label
              role='radio'
              aria-checked={active() === value ? 'true' : 'false'}
              tabindex='0'
              class={
                'el-radio title ' + (active() === value ? 'is-checked' : '')
              }
              style='font-size: 1.4rem; font-weight: 500; padding-bottom: 8px;'
            >
              <span
                class={
                  'el-radio__input ' + (active() === value ? 'is-checked' : '')
                }
              >
                <span class='el-radio__inner'></span>
                <input
                  type='radio'
                  aria-hidden={active() === value ? 'true' : 'false'}
                  tabindex='-1'
                  class='el-radio__original'
                  value={value}
                  onClick={e => {
                    if (active() === value) return;
                    props.on_change(value);
                    set_active(value);
                  }}
                />
              </span>
              <span class='el-radio__label'>{label}</span>
            </label>
            <div class='label' style='padding-left: 24px; font-size: 1.3rem;'>
              {desc}
            </div>
          </div>
        )}
      </For>
    </div>
  );
}

const Settings = () => {
  const settings = get_settings();
  return (
    <>
      <h1 style='margin: 1em 0;'>AniList Modifier Extension</h1>
      <h2>General</h2>
      <CheckBox
        label='Add scores to activity feed'
        value={settings.scored_feed}
        toggle={() => update_setting('scored_feed', !settings.scored_feed)}
      />

      <CheckBox
        label='Automatically scroll to top when activity feed is not loading'
        value={settings.autoscroll}
        toggle={() => update_setting('autoscroll', !settings.autoscroll)}
      />

      <h2 style='margin-top: 1.5em;'>Rating Colors</h2>
      <Radio
        options={[
          {
            value: 'interpolated',
            label: 'Interpolated',
            desc: 'Colors are automatically calculated on a scale from red to green'
          },
          {
            value: 'custom',
            label: 'Custom',
            desc: 'Select your own rating colors'
          },
          {
            value: 'off',
            label: 'Off',
            desc: 'No changes to the rating colors'
          }
        ]}
        value={settings.rating_colors}
        on_change={value => update_setting('rating_colors', value)}
      />

      <h2 style='margin-top: 1.5em;'>Developer Settings</h2>
      <CheckBox
        label='Log extension information in the console'
        value={settings.verbose}
        toggle={() => update_setting('verbose', !settings.verbose)}
      />
    </>
  );
};

export default Settings;
