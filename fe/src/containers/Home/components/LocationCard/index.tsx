import React, { FC } from 'react';
import cn from 'classnames';
import {
  Link,
  Typography,
  Card,
  Box,
  CardContent,
  CardActions,
  CardHeader,
  IconButton,
  Collapse,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import {
  LocationOnOutlined,
  InboxOutlined,
  PhoneOutlined,
  ScheduleOutlined,
  ExpandMoreOutlined,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

import { strings } from '@/i18n';
import { Schedule, DropoffLocationPlaceTypes } from '@/api/src/types';
import { EnhancedDropoffLocation } from '@/contexts';
import { stringifyAddress } from '@/utils';

const useStyles = makeStyles((theme) => ({
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  noSpacing: {
    padding: 0,
    margin: 0,
  },
  listItemBottomMargin: {
    marginBottom: '4px',
  },
  cardContentTopPadding: {
    paddingTop: '0',
  },
  preWrap: {
    whiteSpace: 'pre-wrap',
  },
}));

const ScheduleItem: FC<{ date: Schedule; lastItem: boolean }> = ({ date }) => {
  const classes = useStyles();
  const hoursString =
    `${date.startTime} - ${date.endTime}` === '12:00 AM - 11:59 PM'
      ? strings.locationCard.open24hours
      : `${date.startTime} - ${date.endTime}`;
  return (
    <ListItem disableGutters className={cn(classes.noSpacing, classes.listItemBottomMargin)}>
      <ListItemText className={classes.noSpacing}>
        <Typography variant="body2">
          <span className="bold">
            {`${date.startDate}${
              date.endDate && date.startDate !== date.endDate ? ` - ${date.endDate}` : ''
            } | `}
          </span>
          {hoursString}
        </Typography>
      </ListItemText>
    </ListItem>
  );
};

const ScheduleDisplay: FC<{ schedule: string | Array<Schedule>; name: string }> = ({
  schedule,
  name,
}) => {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const isScheduleArray = (test: string | Array<Schedule>): test is Array<Schedule> =>
    Array.isArray(test);

  let content;

  if (isScheduleArray(schedule)) {
    content = (
      <>
        <List disablePadding>
          {schedule
            .slice()
            .reverse()
            .slice(0, 2)
            .map((date, i) => (
              <ScheduleItem
                date={date}
                key={`${name}-${date.startDate}`}
                lastItem={schedule.length !== i + 1}
              />
            ))}
          {schedule.length > 2 && (
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              {schedule
                .slice()
                .reverse()
                .slice(2)
                .map((date, i) => (
                  <ScheduleItem
                    date={date}
                    key={`${name}-${date.startDate}`}
                    lastItem={schedule.length !== i + 3}
                  />
                ))}
            </Collapse>
          )}
        </List>
        {schedule.length > 2 && !expanded && (
          <Box display="flex">
            <Button onClick={handleExpandClick} color="primary" size="small">
              {`+ ${schedule.length - 2} ${strings.locationCard.more}`}
            </Button>
          </Box>
        )}
      </>
    );
  } else {
    content = (
      <Typography variant="body2" className={classes.preWrap}>
        {schedule}
      </Typography>
    );
  }
  return (
    <Box display="flex" flexDirection="row">
      <Box mr={1}>
        <ScheduleOutlined />
      </Box>
      <Box display="flex" flexDirection="column">
        <Typography variant="caption">{strings.locationCard.schedule}</Typography>
        {content}
      </Box>
    </Box>
  );
};

export const LocationCard: FC<{
  location: EnhancedDropoffLocation;
}> = ({
  location: {
    name,
    type,
    address,
    city,
    state,
    zip,
    phone,
    distance,
    schedule,
    notes,
    placeId,
    placeRequested,
  },
}) => {
  const defaultNameMap: Record<DropoffLocationPlaceTypes, string> = {
    dropbox: strings.locationCard.dropoffLocationTypes.dropbox,
    pollingPlace: strings.locationCard.dropoffLocationTypes.pollingPlace,
    clerk: strings.locationCard.dropoffLocationTypes.clerk,
    earlyVoting: strings.locationCard.dropoffLocationTypes.earlyVoting,
    other: strings.locationCard.dropoffLocationTypes.other,
  };
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const addressString = `${address}+${city}+${state}${zip ? `+${zip}` : ''}`.replace(/\s+/gi, '+');

  // generate the map link. If a place ID is provided, that's preferred.
  // otherwise, if the place hasn't been requested, there's a possibility
  // we can still generate a useful link. If the place has been requested
  // but Google can't place it, the Google Maps link will be broken,
  // so we might as well not render it.
  let mapLink;

  if (placeId) {
    // see https://stackoverflow.com/a/51993646, give place ID but also give address as fallback
    // should work for Google Maps app as well
    mapLink = `https://www.google.com/maps/search/?api=1&query=${addressString}&query_place_id=${placeId}`;
  } else if (!placeRequested) {
    mapLink = `https://www.google.com/maps/place/${addressString}`;
  }

  return (
    <Box mb={2} data-result={address.replace(/\s+/g, '-')}>
      <Card>
        <CardHeader
          /* eslint-disable react/jsx-wrap-multilines */
          title={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              {name || address}
              {distance && (
                <Box minWidth={60} display="flex" justifyContent="flex-end">
                  <Typography variant="body1" className="bold" color="textSecondary" noWrap>
                    {`${Math.round((10 * distance) / 1609.34) / 10} mi`}
                  </Typography>
                </Box>
              )}
            </Box>
          }
          /* eslint-enable react/jsx-wrap-multilines */
        />
        <CardContent>
          <Box display="flex" flexDirection="column">
            <Box display="flex" flexDirection="row" mb={2}>
              <Box mr={1}>
                <LocationOnOutlined />
              </Box>
              <Box display="flex" flexDirection="column">
                <Typography variant="caption">{strings.locationCard.location}</Typography>
                <Typography variant="body2">
                  {mapLink ? (
                    <Link className="bold" rel="noopener" href={mapLink} target="_blank">
                      {stringifyAddress({ streetAddress: address, city, state, zipcode: zip })}
                    </Link>
                  ) : (
                    stringifyAddress({ streetAddress: address, city, state, zipcode: zip })
                  )}
                </Typography>
              </Box>
            </Box>
            {type && (
              <Box display="flex" flexDirection="row" mb={2}>
                <Box mr={1}>
                  <InboxOutlined />
                </Box>
                <Box display="flex" flexDirection="column">
                  <Typography variant="caption">{strings.locationCard.dropoffPlaceType}</Typography>
                  <Typography variant="body2">{defaultNameMap[type]}</Typography>
                </Box>
              </Box>
            )}
            {phone && (
              <Box display="flex" flexDirection="row" mb={2}>
                <Box mr={1}>
                  <PhoneOutlined />
                </Box>
                <Box display="flex" flexDirection="column">
                  <Typography variant="caption">{strings.locationCard.phone}</Typography>
                  <Typography variant="body2">
                    <Link href={`tel:${phone}`}>{phone}</Link>
                  </Typography>
                </Box>
              </Box>
            )}
            {schedule && <ScheduleDisplay schedule={schedule} name={name} />}
          </Box>
        </CardContent>
        {notes && (
          <Box>
            <CardActions>
              <Button onClick={handleExpandClick} color="primary" size="small">
                {strings.locationCard.seeMore}
              </Button>
              <IconButton
                className={cn(classes.expand, {
                  [classes.expandOpen]: expanded,
                })}
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label={strings.locationCard.seeMore}
                size="small"
              >
                <ExpandMoreOutlined />
              </IconButton>
            </CardActions>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <CardContent className={classes.cardContentTopPadding}>
                <Typography variant="body2" className={classes.preWrap}>
                  {notes}
                </Typography>
              </CardContent>
            </Collapse>
          </Box>
        )}
      </Card>
    </Box>
  );
};
