import { createSignal, For, Show } from 'solid-js';
import { default_settings, ExtensionSettings } from '../../../settings';
import { styled } from 'solid-styled-components';
import settings from '../../../background/settings';

const MainWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: min-content;
`;

const ColorWrapper = styled('div')`
  display: flex;
  align-items: center;
  margin-left: 1.5em;
  gap: 0.6em;

  & > div {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    flex-direction: column;
    gap: 0.2em;

    & > span {
      text-align: center;
      font-size: 1.2em;
    }

    & > input {
      cursor: pointer;
      border: 0;
      width: 2em;
      height: 2em;
      padding: 0;
      border-radius: 0.4em;
      position: relative;

      appearance: none;
      -moz-appearance: none;
      -webkit-appearance: none;
      background: none;

      &:focus {
        border-radius: 0;
        outline: none;
      }

      &::-webkit-color-swatch-wrapper {
        padding: 0;
        border-radius: 0;
      }

      &::-webkit-color-swatch {
        border: none;
        border-radius: 0;
      }

      &::-moz-color-swatch,
      &::-moz-focus-inner {
        border-color: red;
      }

      &::-moz-focus-inner {
        padding: 0;
      }

      &::after {
        content: '';
        cursor: pointer;
        border-radius: inherit;
        position: absolute;
        width: 2.3em;
        height: 2.3em;
        top: -0.15em;
        border: 4px solid rgb(var(--color-foreground));
        left: -0.15em;
      }
    }
  }
`;

const Button = styled('div')`
  align-items: center;
  background: rgb(var(--color-blue));
  border-radius: 4px;
  color: rgb(var(--color-text-bright));
  cursor: pointer;
  display: inline-flex;
  font-size: 1.3rem;
  margin-right: 10px;
  margin-top: 15px;
  padding: 10px 15px;
  transition: 0.2s;
`;

const Message = styled('p')`
  margin: 1em 0 0.5em 0;
  text-align: center;
  font-size: 0.9em;
`;

const CustomColorSelector = (props: {
  settings: ExtensionSettings;
  on_change: (colors: string[]) => void;
}) => {
  const [colors, set_colors] = createSignal(props.settings.custom_colors);
  const [message, set_message] = createSignal('');

  return (
    <MainWrapper>
      <ColorWrapper>
        <For each={colors()}>
          {(color, index) => (
            <div>
              <span style={'color: ' + color}>{index() + 1}</span>
              <input
                type='color'
                value={color}
                onChange={e => {
                  set_colors(c => [
                    ...c.slice(0, index()),
                    e.target.value,
                    ...c.slice(index() + 1)
                  ]);
                }}
              />
            </div>
          )}
        </For>
      </ColorWrapper>
      <div>
        <Button
          onClick={() => {
            props.on_change(colors());
            set_message('Updated colors');
          }}
        >
          Save
        </Button>
        <Button
          style='background: rgba(var(--color-red), .8); color: rgb(var(--color-white));'
          onClick={() => {
            if (
              confirm('Are you sure? This cannot be reversed automatically.')
            ) {
              set_colors(default_settings().custom_colors);
              set_message('Colors reset to default');
            }
          }}
        >
          Reset
        </Button>
      </div>
      <Show when={message()}>
        <Message>{message()}</Message>
      </Show>
    </MainWrapper>
  );
};

export default CustomColorSelector;
