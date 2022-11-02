import { UserSynapse } from 'modules/synapse/entities/user-synapse.entity';
// import { faker } from '@faker-js/faker';

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

// export const createSynapseAccount = async ({
//   userId,
//   userSynapseId,
//   depositNodeId,
//   refreshToken,
// }: Partial<UserSynapse>): Promise<UserSynapse> => {
//   const synapseAccount = new UserSynapse({
//     userId: userId,
//     userSynapseId: userSynapseId,
//     depositNodeId: depositNodeId,
//     refreshToken: refreshToken,
//   });

//   return userSynapse.save();
// };
