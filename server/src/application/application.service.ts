import { Injectable, Logger } from '@nestjs/common'
import * as nanoid from 'nanoid'
import { CreateApplicationDto } from './dto/create-application.dto'
import { ApplicationPhase, ApplicationState, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateApplicationDto } from './dto/update-application.dto'
import {
  APPLICATION_SECRET_KEY,
  ServerConfig,
  TASK_LOCK_INIT_TIME,
} from '../constants'
import { GenerateAlphaNumericPassword } from '../utils/random'

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name)
  constructor(private readonly prisma: PrismaService) {}

  async create(userid: string, dto: CreateApplicationDto) {
    try {
      // get bundle
      const bundle = await this.prisma.bundle.findFirstOrThrow({
        where: {
          id: dto.bundleId,
          region: {
            id: dto.regionId,
          },
        },
      })

      // create app in db
      const appSecret = {
        name: APPLICATION_SECRET_KEY,
        value: GenerateAlphaNumericPassword(64),
      }
      const appid = await this.tryGenerateUniqueAppid()

      const data: Prisma.ApplicationCreateInput = {
        name: dto.name,
        appid,
        state: dto.state || ApplicationState.Running,
        phase: ApplicationPhase.Creating,
        tags: [],
        createdBy: userid,
        lockedAt: TASK_LOCK_INIT_TIME,
        region: {
          connect: {
            id: dto.regionId,
          },
        },
        bundle: {
          create: {
            bundleId: bundle.id,
            name: bundle.name,
            displayName: bundle.displayName,
            price: bundle.price,
            resource: { ...bundle.resource },
          },
        },
        runtime: {
          connect: {
            id: dto.runtimeId,
          },
        },
        configuration: {
          create: {
            environments: [appSecret],
            dependencies: [],
          },
        },
      }

      const application = await this.prisma.application.create({ data })
      if (!application) {
        throw new Error('create application failed')
      }

      return application
    } catch (error) {
      this.logger.error(error, error.response?.body)
      return null
    }
  }

  async findAllByUser(userid: string) {
    return this.prisma.application.findMany({
      where: {
        createdBy: userid,
        phase: {
          not: ApplicationPhase.Deleted,
        },
      },
    })
  }

  async findOne(appid: string, include?: Prisma.ApplicationInclude) {
    const application = await this.prisma.application.findUnique({
      where: { appid },
      include: {
        region: false,
        bundle: include?.bundle,
        runtime: include?.runtime,
        configuration: include?.configuration,
        domain: include?.domain,
      },
    })

    return application
  }

  async update(appid: string, dto: UpdateApplicationDto) {
    try {
      // update app in db
      const data: Prisma.ApplicationUpdateInput = {
        updatedAt: new Date(),
      }
      if (dto.name) {
        data.name = dto.name
      }
      if (dto.state) {
        data.state = dto.state
      }

      const application = await this.prisma.application.updateMany({
        where: {
          appid,
          phase: {
            notIn: [ApplicationPhase.Deleting, ApplicationPhase.Deleted],
          },
        },
        data,
      })

      return application
    } catch (error) {
      this.logger.error(error, error.response?.body)
      return null
    }
  }

  async remove(appid: string) {
    try {
      const res = await this.prisma.application.updateMany({
        where: {
          appid,
          phase: {
            in: [ApplicationPhase.Started, ApplicationPhase.Stopped],
          },
        },
        data: {
          state: ApplicationState.Deleted,
        },
      })

      return res
    } catch (error) {
      this.logger.error(error, error.response?.body)
      return null
    }
  }

  private generateAppID(len: number) {
    len = len || 6

    // ensure prefixed with letter
    const only_alpha = 'abcdefghijklmnopqrstuvwxyz'
    const alphanumeric = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const prefix = nanoid.customAlphabet(only_alpha, 1)()
    const nano = nanoid.customAlphabet(alphanumeric, len - 1)
    return prefix + nano()
  }

  /**
   * Generate unique application id
   * @returns
   */
  async tryGenerateUniqueAppid() {
    for (let i = 0; i < 10; i++) {
      const appid = this.generateAppID(ServerConfig.APPID_LENGTH)
      const existed = await this.prisma.application.findUnique({
        where: { appid },
        select: { appid: true },
      })
      if (!existed) {
        return appid
      }
    }

    throw new Error('Generate appid failed')
  }
}
