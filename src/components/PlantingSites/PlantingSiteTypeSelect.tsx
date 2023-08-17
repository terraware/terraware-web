import PlantingSiteSelectTypeModal from './PlantingSiteSelectTypeModal';
import { APP_PATHS } from 'src/constants';
import DetailedPlantingSiteHelpModal from 'src/components/PlantingSites/DetailedPlantingSiteHelpModal';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';

export type PlantingSiteTypeSelectProps = {
  open: boolean;
  onClose: () => void;
};

export default function PlantingSiteTypeSelect(props: PlantingSiteTypeSelectProps): JSX.Element {
  const { open, onClose } = props;
  const [plantingSiteTypeModalOpen, setPlantingSiteTypeModalOpen] = useState(false);
  const [plantingSiteTypeHelpModalOpen, setPlantingSiteTypeHelpModalOpen] = useState(false);
  const history = useHistory();

  useEffect(() => {
    setPlantingSiteTypeModalOpen(open);
  }, [open]);

  const goTo = (appPath: string) => {
    const appPathLocation = {
      pathname: appPath,
    };
    history.push(appPathLocation);
  };

  return (
    <>
      <PlantingSiteSelectTypeModal
        open={plantingSiteTypeModalOpen}
        onNext={(goToCreate) => {
          if (goToCreate) {
            goTo(APP_PATHS.PLANTING_SITES_NEW);
          } else {
            setPlantingSiteTypeHelpModalOpen(true);
          }
        }}
        onClose={() => {
          setPlantingSiteTypeModalOpen(false);
          onClose();
        }}
      />
      <DetailedPlantingSiteHelpModal
        open={plantingSiteTypeHelpModalOpen}
        onClose={() => {
          setPlantingSiteTypeHelpModalOpen(false);
          onClose();
        }}
      />
    </>
  );
}
