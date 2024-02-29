import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import { SiteType } from 'src/types/PlantingSite';
import isEnabled from 'src/features';
import DetailedPlantingSiteHelpModal from './DetailedPlantingSiteHelpModal';
import PlantingSiteSelectTypeModal from './PlantingSiteSelectTypeModal';
import PlantingSiteSelectTypeModal2 from './PlantingSiteSelectTypeModal2';

export type PlantingSiteTypeSelectProps = {
  open: boolean;
  onClose: () => void;
};

export default function PlantingSiteTypeSelect(props: PlantingSiteTypeSelectProps): JSX.Element {
  const { open, onClose } = props;
  const [plantingSiteTypeModalOpen, setPlantingSiteTypeModalOpen] = useState(false);
  const [plantingSiteTypeHelpModalOpen, setPlantingSiteTypeHelpModalOpen] = useState(false);
  const history = useHistory();
  const userDrawnDetailedSites = isEnabled('User Detailed Sites');

  useEffect(() => {
    setPlantingSiteTypeModalOpen(open);
  }, [open]);

  const goTo = (appPath: string, search?: string) => {
    const appPathLocation = {
      pathname: appPath,
      search,
    };
    history.push(appPathLocation);
  };

  if (userDrawnDetailedSites) {
    return (
      <PlantingSiteSelectTypeModal2
        open={plantingSiteTypeModalOpen}
        onNext={(siteType: SiteType) =>
          void goTo(APP_PATHS.PLANTING_SITES_DRAFT_NEW, siteType === 'detailed' ? '?detailed' : '')
        }
        onClose={() => {
          setPlantingSiteTypeModalOpen(false);
          onClose();
        }}
      />
    );
  }

  return (
    <>
      <PlantingSiteSelectTypeModal
        open={plantingSiteTypeModalOpen}
        onNext={(siteType: SiteType) => {
          if (siteType === 'simple') {
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
