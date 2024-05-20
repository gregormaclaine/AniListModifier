import { CheckBox, Radio } from './inputs';
import { update as update_setting, get as get_settings } from '../../settings';
import { createSignal, Show } from 'solid-js';
import CustomColorSelector from './CustomColorSelector';

const Settings = () => {
  const [settings, set_settings] = createSignal(get_settings());

  return (
    <>
      <h1 style='margin: 1em 0;'>AniList Modifier Extension</h1>
      <h2>General</h2>
      <CheckBox
        label='Add scores to activity feed'
        value={settings().scored_feed}
        toggle={() => {
          update_setting('scored_feed', !settings().scored_feed);
          set_settings(get_settings());
        }}
      />

      <CheckBox
        label='Automatically scroll to top when activity feed is not loading'
        value={settings().autoscroll}
        toggle={() => {
          update_setting('autoscroll', !settings().autoscroll);
          set_settings(get_settings());
        }}
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
        value={settings().rating_colors}
        on_change={value => {
          update_setting('rating_colors', value);
          set_settings(get_settings());
        }}
      />

      <Show when={settings().rating_colors === 'custom'}>
        <CustomColorSelector
          settings={settings()}
          on_change={colors => {
            update_setting('custom_colors', colors);
            set_settings(get_settings());
          }}
        />
      </Show>

      <h2 style='margin-top: 1.5em;'>Developer Settings</h2>
      <CheckBox
        label='Log extension information in the console'
        value={settings().verbose}
        toggle={() => {
          update_setting('verbose', !settings().verbose);
          set_settings(get_settings());
        }}
      />
    </>
  );
};

export default Settings;
