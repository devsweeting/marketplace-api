import { UserSynapse } from 'modules/synapse/entities/user-synapse.entity';

export const createSynapseUser = async ({
  userId,
  userSynapseId,
  depositNodeId,
  refreshToken,
}: Partial<UserSynapse>): Promise<UserSynapse> => {
  const userSynapse = new UserSynapse({
    userId: userId,
    userSynapseId: userSynapseId,
    depositNodeId: depositNodeId,
    refreshToken: refreshToken,
  });

  return userSynapse.save();
};
