import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  FC,
  ChangeEvent,
  KeyboardEvent,
} from 'react';
import usePlacesAutocomplete from 'use-places-autocomplete';
import TagManager from 'react-gtm-module';
import { makeStyles } from '@material-ui/core/styles';
import {
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Paper,
  Box,
} from '@material-ui/core';
import { LocationOnOutlined } from '@material-ui/icons';
import { AddressContext } from '@/contexts';
import { stringifyAddress } from '@/utils';
import { strings } from '@/i18n';

const tagManagerArgs = {
  gtmId: 'GTM-NTGDXJF',
  dataLayerName: 'search',
};

const useStyles = makeStyles(() => ({
  addressInput: {
    position: 'relative',
  },
  locationsList: {
    position: 'absolute',
    zIndex: 100,
    width: '100%',
  },
  selected: {
    backgroundColor: '#D3D3D3',
  },
}));

const ARROW_UP = 'ArrowUp';
const ARROW_DOWN = 'ArrowDown';
const ENTER = 'Enter';
const ESCAPE = 'Escape';

const acceptedKeys = [ARROW_UP, ARROW_DOWN, ENTER, ESCAPE];

export const Address: FC = () => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: {
        country: ['us'],
      },
    },
    debounce: 300,
  });

  const classes = useStyles();
  const { address, geocodeAddress } = useContext(AddressContext);
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  const cachedInputValue = useRef<string>();

  useEffect(() => {
    if (address) {
      setValue(stringifyAddress(address), false);
    } else {
      setValue('', false);
    }
  }, [address]);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    cachedInputValue.current = e.target.value;
  };

  const dismissSuggestions = () => {
    setSelectedItemIndex(null);
    clearSuggestions();
  };

  const handleSelect = ({
    description,
    place_id,
  }: {
    description: string;
    place_id: string;
  }): void => {
    TagManager.initialize(tagManagerArgs);
    const ReactPixel = require('react-facebook-pixel'); // eslint-disable-line
    ReactPixel.default.track('Search', description);
    TagManager.dataLayer({ dataLayer: { event: 'search', address: description } });
    setValue(description, false);
    dismissSuggestions();
    geocodeAddress(place_id);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (status !== 'OK' || !acceptedKeys.includes(e.key)) {
      return;
    }

    if (e.key === ESCAPE) {
      dismissSuggestions();
      return;
    }

    if (e.key === ENTER) {
      e.preventDefault();
      if (selectedItemIndex != null) {
        handleSelect(data[selectedItemIndex]);
      } else {
        // in the event we don't have an autocomplete selection,
        // what do we do? Do we want to make a query via places?
        // For now, we do nothing.
      }
      return;
    }

    let nextIndex: number | null = null;

    if (e.key === ARROW_UP) {
      e.preventDefault(); // prevents cursor from going to the start of the input box
      nextIndex = selectedItemIndex ?? data.length;
      nextIndex = nextIndex > 0 ? nextIndex - 1 : null;
    } else {
      nextIndex = selectedItemIndex ?? -1;
      nextIndex = nextIndex < data.length - 1 ? nextIndex + 1 : null;
    }

    setSelectedItemIndex(nextIndex);
    setValue(data[nextIndex] ? data[nextIndex].description : cachedInputValue.current, false);
  };

  return (
    <Box mb={3}>
      <form autoComplete="off" className={classes.addressInput}>
        <TextField
          id="address-input"
          label={strings.address.address}
          helperText={strings.address.helperText}
          onChange={handleInput}
          value={value}
          disabled={!ready}
          fullWidth
          inputProps={{
            onFocus: () => {
              setInputFocused(true);
            },
            onBlur: () => {
              setTimeout(() => {
                setInputFocused(false);
                setSelectedItemIndex(null);
              }, 300);
            },
            onKeyDown: handleKeyDown,
          }}
        />
        {status === 'OK' && inputFocused === true && (
          <Paper className={classes.locationsList} elevation={3}>
            <List>
              {data.map(
                (
                  {
                    place_id,
                    description,
                    structured_formatting: { main_text: typed, secondary_text: completed },
                  },
                  idx,
                ) => (
                  <ListItem
                    className={selectedItemIndex === idx ? classes.selected : ''}
                    key={place_id}
                    button
                    onClick={() => {
                      handleSelect({ place_id, description });
                    }}
                  >
                    <ListItemIcon>
                      <LocationOnOutlined />
                    </ListItemIcon>
                    <ListItemText>
                      <Typography>
                        <span className="bold">{typed}</span>
                        {` ${completed}`}
                      </Typography>
                    </ListItemText>
                  </ListItem>
                ),
              )}
            </List>
          </Paper>
        )}
      </form>
    </Box>
  );
};
