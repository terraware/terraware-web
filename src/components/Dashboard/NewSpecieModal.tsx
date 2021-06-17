import {
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import React from "react";
import strings from "../../strings";
import useForm from "../../utils/useForm";
import CancelButton from "../common/CancelButton";
import DialogCloseButton from "../common/DialogCloseButton";
import TextField from "../common/TextField";
import { SpeciesDetail } from "../Species";
import { SpecieMap } from "./Map";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    actions: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingLeft: theme.spacing(2),
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(1),
    },
    paper: {
      minWidth: "500px",
    },
    container: {
      border: `1px solid ${theme.palette.grey[400]}`,
      borderRadius: "4px",
      display: "block",
      padding: theme.spacing(1),
    },
  })
);

export interface Props {
  open: boolean;
  onClose: (specie?: SpeciesDetail) => void;
  value?: SpecieMap;
}

export default function NewSpecieModal(props: Props): JSX.Element {
  function initSpecies(specie?: SpecieMap): SpeciesDetail {
    return specie
      ? {
          name:
            specie.properties.NAME !== "Other" ? specie.properties.NAME : "",
          id: specie.properties.SPECIE_ID,
        }
      : {
          name: "",
        };
  }

  const classes = useStyles();
  const { onClose, open } = props;
  const [record, setRecord, onChange] = useForm<SpeciesDetail>(
    initSpecies(props.value)
  );

  React.useEffect(() => {
    if (props.open) {
      setRecord(initSpecies(props.value));
    }
  }, [props.open, props.value, setRecord]);

  const handleCancel = () => {
    setRecord(initSpecies(props.value));
    onClose();
  };

  const handleOk = () => {
    onClose(record);
  };

  const [value, setValue] = React.useState("female");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  return (
    <Dialog
      onClose={handleCancel}
      disableEscapeKeyDown
      open={open}
      maxWidth="md"
      classes={{ paper: classes.paper }}
    >
      <DialogTitle>
        <Typography variant="h6">
          {props.value?.properties.NAME !== "Other"
            ? "Edit Species"
            : "Add Species"}
        </Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextField
              id="name"
              value={record.name}
              onChange={onChange}
              label={strings.SPECIES_NAME}
              aria-label="Species Name"
            />
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography component="p" variant="subtitle2">
              OR
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <FormControl component="fieldset" className={classes.container}>
              <RadioGroup
                aria-label="gender"
                name="gender1"
                value={value}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="female"
                  control={<Radio />}
                  label="Flower"
                />
                <FormControlLabel
                  value="male"
                  control={<Radio />}
                  label="Dododanea"
                />
                <FormControlLabel
                  value="other"
                  control={<Radio />}
                  label="Acacia"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box width={"100%"} className={classes.actions}>
          <Box>
            <CancelButton onClick={handleCancel} />
            <Chip
              id="saveSpecie"
              className={classes.submit}
              label={props.value?.properties.NAME !== "Other" ? "Save" : "Add"}
              clickable
              color="primary"
              onClick={handleOk}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
