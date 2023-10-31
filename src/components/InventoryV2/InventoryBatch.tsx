import TfMain from 'src/components/common/TfMain';

type OriginPage = 'Nursery' | 'Species';

type InventoryBatchProps = {
  origin: OriginPage;
};

export default function InventoryBatch({ origin }: InventoryBatchProps) {
  // TODO: construct parent path for breadcrumbs based on origin

  return (
    <TfMain>
      TODO: Add batch details and history
    </TfMain>
  );
}