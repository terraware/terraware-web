import PageForm from 'src/components/common/PageForm';

import VotingWrapper from './VotingWrapper';

const VotingEdit = () => {
  const onCancel = () => {
    return;
  };

  const onSave = () => {
    return;
  };

  return (
    <VotingWrapper isForm>
      <PageForm cancelID='cancelSave' onCancel={onCancel} onSave={onSave} saveID='saveVotes'>
        TODO: Edit WIP
      </PageForm>
    </VotingWrapper>
  );
};

export default VotingEdit;
